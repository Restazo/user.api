import { Request, Response } from "express";
import bcrypt from "bcrypt";

import pool from "../db.js";

import { sendResponse } from "../helpers/responses.js";
import logger from "../helpers/logger.js";
import { generatePin } from "../helpers/generatePin.js";
import sendConfirmationEmail from "../helpers/sendConfirmationEmail.js";
import { signTokens } from "../helpers/jwtTools.js";

import { getFullWaiterData } from "../data/waiter.js";

import { Operation } from "../schemas/responseMaps.js";
import {
  deleteWaiterRefreshToken,
  logInTheWaiter,
  renewWaiterRefreshToken,
  resetWaiterConfirmationDetails,
  setWaiterConfirmationPin,
} from "../lib/waiter.js";
import { waiterLogInReq } from "../schemas/waiter.js";

export const confirmationPinValidityPeriod = Number(
  process.env.DEFAULT_PIN_VALIDITY_PERIOD
);

export const waiterLogIn = async (req: Request, res: Response) => {
  const validatedReq = waiterLogInReq.safeParse(req.body);
  if (!validatedReq.success) {
    return sendResponse(res, "Invalid request body", Operation.BadRequest);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const waiterData = await getFullWaiterData(validatedReq.data.email, client);

    if (
      !waiterData ||
      !(await bcrypt.compare(validatedReq.data.pin, waiterData.pin))
    ) {
      await client.query("ROLLBACK");

      return sendResponse(res, "Invalid credentials", Operation.BadRequest);
    }

    const confirmationPin = generatePin();

    const hashedPin = await bcrypt.hash(confirmationPin.toString(), 10);
    await setWaiterConfirmationPin(hashedPin, validatedReq.data.email, client);

    const emailSent = await sendConfirmationEmail(
      waiterData.email,
      confirmationPin
    );

    if (!emailSent) {
      await client.query("ROLLBACK");

      return sendResponse(
        res,
        "Failed to send a confirmation email",
        Operation.ServerError
      );
    }

    await client.query("COMMIT");
    return sendResponse(
      res,
      "Successful waiter log in, please confirm your email",
      Operation.Ok
    );
  } catch (e) {
    await client.query("ROLLBACK");

    logger("Failed to log in the waiter", e);

    return sendResponse(res, "Something went wrong", Operation.ServerError);
  } finally {
    client.release();
  }
};

export const waiterLogInConfirm = async (req: Request, res: Response) => {
  const validatedReq = waiterLogInReq.safeParse(req.body);

  if (!validatedReq.success) {
    return sendResponse(res, "Invalid request", Operation.BadRequest);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const waiterData = await getFullWaiterData(validatedReq.data.email, client);

    if (
      !waiterData ||
      waiterData.confirmationPin === null ||
      waiterData.minutesDifference === null ||
      !(await bcrypt.compare(validatedReq.data.pin, waiterData.confirmationPin))
    ) {
      return sendResponse(res, "Invalid credentials", Operation.BadRequest);
    }

    if (waiterData.minutesDifference >= confirmationPinValidityPeriod) {
      await resetWaiterConfirmationDetails(validatedReq.data.email, client);
      await client.query("COMMIT");

      return sendResponse(res, "Expired pin code", Operation.Forbidden);
    }

    const { accessToken, refreshToken } = signTokens({
      waiterId: waiterData.id,
      restaurantId: waiterData.restaurantId,
      waiterEmail: waiterData.email,
      waiterName: waiterData.name,
    });

    await logInTheWaiter(validatedReq.data.email, refreshToken, client);

    await client.query("COMMIT");

    res.setHeader("Authorization", `Bearer ${accessToken}`);
    return sendResponse(res, "Successful login", Operation.Ok, {
      email: waiterData.email,
      name: waiterData.name,
    });
  } catch (e) {
    await client.query("ROLLBACK");

    logger("Failed to confirm waiter log in", e);

    return sendResponse(
      res,
      "Failed to confirm your logging in",
      Operation.ServerError
    );
  } finally {
    client.release();
  }
};

export const waiterLogOut = async (req: Request, res: Response) => {
  try {
    await deleteWaiterRefreshToken(req.waiter.waiterId);

    return sendResponse(res, "Successful log out", Operation.Ok);
  } catch (e) {
    logger("Failed to log out waiter", e);
    return sendResponse(res, "Failed to log you out", Operation.ServerError);
  }
};

export const getSession = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = signTokens({
    waiterId: req.waiter.waiterId,
    waiterEmail: req.waiter.waiterEmail,
    restaurantId: req.waiter.restaurantId,
    waiterName: req.waiter.waiterName,
  });

  try {
    const waiterName = await renewWaiterRefreshToken(
      refreshToken,
      req.waiter.waiterId
    );

    res.setHeader("Authorization", `Bearer ${accessToken}`);
    return sendResponse(res, "Successfuly renewed your session", Operation.Ok, {
      email: req.waiter.waiterEmail,
      name: waiterName,
    });
  } catch (e) {
    logger("Failed to new waiter session", e);

    return sendResponse(
      res,
      "Failed to renew your session",
      Operation.ServerError
    );
  }
};
