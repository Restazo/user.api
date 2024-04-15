import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { sendResponse } from "../helpers/responses.js";
import { Operation } from "../helpers/types/responseMaps.js";
import waiterLogInReq from "../schemas/waiterLogInReq.js";
import pool from "../db.js";
import {
  getWaiterByEmail,
  getWaiterConfirmationFieldsByEmail,
  resetWaiterConfirmationFields,
  setWaiterConfirmationPin,
} from "../data/waiter.js";
import logger from "../helpers/logger.js";
import { generatePin } from "../helpers/generatePin.js";
import { resend, confirmationEmail } from "../resend.js";

export const waiterLogIn = async (req: Request, res: Response) => {
  const validatedReq = waiterLogInReq.safeParse(req.body);

  if (!validatedReq.success) {
    return sendResponse(res, "Invalid request body", Operation.BadRequest);
  }
  try {
    const waiterData = await getWaiterByEmail(validatedReq.data.email);

    if (
      !waiterData ||
      !(await bcrypt.compare(validatedReq.data.pin, waiterData.pin))
    ) {
      return sendResponse(res, "Invalid credentials", Operation.BadRequest);
    }

    const confirmationPin = generatePin();

    const hashedPin = await bcrypt.hash(confirmationPin.toString(), 10);
    await setWaiterConfirmationPin(hashedPin, validatedReq.data.email);

    const { data, error } = await resend.emails.send({
      from: "Restazo Inc. <confirmations@restazo.com>",
      to: [waiterData.email],
      subject: "Hello World",
      html: confirmationEmail(confirmationPin),
    });

    if (error) {
      logger(`Failed to send an email to ${waiterData.email}`, error);
      return sendResponse(
        res,
        "Failed to send a confirmation email",
        Operation.ServerError
      );
    }

    return sendResponse(
      res,
      "Successful waiter log in, please confirm your email",
      Operation.Ok
    );
  } catch (e) {
    logger("Failed to log in the waiter", e);
    return sendResponse(res, "Something went wrong", Operation.ServerError);
  }
};

export const waiterLogInConfirm = async (req: Request, res: Response) => {
  const validatedReq = waiterLogInReq.safeParse(req.body);

  if (!validatedReq.success) {
    return sendResponse(res, "Invalid request", Operation.BadRequest);
  }

  try {
    const confirmationData = await getWaiterConfirmationFieldsByEmail(
      validatedReq.data.email
    );

    if (
      !confirmationData ||
      !(await bcrypt.compare(
        validatedReq.data.pin,
        confirmationData.confirmationPin
      ))
    ) {
      return sendResponse(res, "Invalid credentials", Operation.BadRequest);
    }

    // generate tokens, set them in db and send to the client
    await resetWaiterConfirmationFields(validatedReq.data.email);

    return sendResponse(res, "Successful login", Operation.Ok);
  } catch (e) {
    logger("Failed to confirm waiter log in", e);
    return sendResponse(res, "Something went wrong", Operation.ServerError);
  }
};

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
