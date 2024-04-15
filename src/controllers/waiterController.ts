import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { sendResponse } from "../helpers/responses.js";
import { Operation } from "../helpers/types/responseMaps.js";
import waiterLogInReq from "../schemas/waiterLogInReq.js";
import pool from "../db.js";

export const waiterLogIn = async (req: Request, res: Response) => {
  const validatedReq = waiterLogInReq.safeParse(req.body);

  if (!validatedReq.success) {
    return sendResponse(res, "Invalid request body", Operation.BadRequest);
  }

  return sendResponse(res, "Successful waiter log in", Operation.Ok);
};

export const waiterRegister = async (req: Request, res: Response) => {
  const validatedReq = waiterLogInReq.safeParse(req.body);

  if (!validatedReq.success) {
    return sendResponse(res, "Invalid request body", Operation.BadRequest);
  }

  // Hash password
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
