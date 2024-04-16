import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { sendResponse } from "../helpers/responses.js";
import { Operation } from "../schemas/types/responseMaps.js";
import waiterLogInReq from "../schemas/waiterLogInReq.js";
import pool from "../db.js";
import {
  getWaiterByEmail,
  getFullWaiterData,
  logInTheWaiter,
  resetWaiterConfirmationDetails,
  setWaiterConfirmationPin,
  deleteWaiterRefreshToken,
  renewWaiterRefreshToken,
} from "../data/waiter.js";
import logger from "../helpers/logger.js";
import { generatePin } from "../helpers/generatePin.js";
import sendConfirmationEmail from "../helpers/sendConfirmationEmail.js";
import { signTokens } from "../helpers/jwtTools.js";

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
    const waiterData = await getWaiterByEmail(validatedReq.data.email, client);

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
      waiterData &&
      waiterData.minutesDifference >= confirmationPinValidityPeriod
    ) {
      await resetWaiterConfirmationDetails(validatedReq.data.email, client);
      await client.query("COMMIT");

      return sendResponse(res, "Expired pin code", Operation.Forbidden);
    }

    if (
      !waiterData ||
      !(await bcrypt.compare(validatedReq.data.pin, waiterData.confirmationPin))
    ) {
      await client.query("ROLLBACK");

      return sendResponse(res, "Invalid credentials", Operation.BadRequest);
    }

    const { accessToken, refreshToken } = signTokens({
      waiter_id: waiterData.id,
      restaurant_id: waiterData.restaurantId,
      waiter_email: waiterData.email,
    });

    await logInTheWaiter(validatedReq.data.email, refreshToken, client);

    await client.query("COMMIT");

    res.setHeader("Authorization", `Bearer ${accessToken}`);
    return sendResponse(res, "Successful login", Operation.Ok);
  } catch (e) {
    await client.query("ROLLBACK");

    logger("Failed to confirm waiter log in", e);

    return sendResponse(res, "Failed to log you in", Operation.ServerError);
  } finally {
    client.release();
  }
};

export const waiterLogOut = async (req: Request, res: Response) => {
  try {
    await deleteWaiterRefreshToken(req.waiter.waiter_id);

    return sendResponse(res, "Successful log out", Operation.Ok);
  } catch (e) {
    logger("Failed to log out waiter", e);
    return sendResponse(res, "Failed to log you out", Operation.ServerError);
  }
};

export const renewSession = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = signTokens({
    waiter_id: req.waiter.waiter_id,
    waiter_email: req.waiter.waiter_email,
    restaurant_id: req.waiter.restaurant_id,
  });

  try {
    await renewWaiterRefreshToken(refreshToken, req.waiter.waiter_id);

    res.setHeader("Authorization", `Bearer ${accessToken}`);
    return sendResponse(res, "Successfuly renewed your session", Operation.Ok);
  } catch (e) {
    logger("Failed to new waiter session", e);

    return sendResponse(
      res,
      "Failed to renew your session",
      Operation.ServerError
    );
  }
};

// ///////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////
// TODO: delete this function
export const waiterRegister = async (req: Request, res: Response) => {
  const validatedReq = waiterLogInReq.safeParse(req.body);

  if (!validatedReq.success) {
    return sendResponse(res, "Invalid request body", Operation.BadRequest);
  }

  const hashedPin = await bcrypt.hash(validatedReq.data.pin, 10);

  await pool.query(
    `INSERT
     INTO waiter
       (restaurant_id,
        email,
        pin)
     VALUES 
       ($1,
        $2,
        $3)`,
    ["11111111-1111-1111-1111-111111111111", validatedReq.data.email, hashedPin]
  );

  return sendResponse(res, "Successful waiter registeration", Operation.Ok);
};
