import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { sendResponse } from "./responses.js";
import { Operation } from "../schemas/types/responseMaps.js";
import { TokenType, verifyToken } from "./jwtTools.js";
import { authTokensPayload } from "../schemas/authTokens.js";
import pool from "../db.js";
import { deleteWaiterRefreshToken } from "../data/waiter.js";

export const protectWaiterRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers["authorization"]?.split(" ")[1];

  if (!accessToken) {
    return sendResponse(res, "Invalid session", Operation.Unauthorized);
  }

  const accessTokenPayload: any = jwt.decode(accessToken);

  const payloadVerified = authTokensPayload.safeParse(accessTokenPayload);

  if (!payloadVerified.success) {
    return sendResponse(res, "Invalid token", Operation.BadRequest);
  }

  const result = await pool.query(
    `SELECT refresh_token as "refreshToken", id FROM waiter WHERE id = $1;`,
    [accessTokenPayload.waiter_id]
  );

  if (result.rowCount === 0) {
    return sendResponse(res, "Invalid token", Operation.BadRequest);
  }
  const oldRefreshToken = result.rows[0].refreshToken;

  if (oldRefreshToken === null) {
    return sendResponse(
      res,
      "You are logged out, please log in",
      Operation.Forbidden
    );
  }

  const accessTokenValid = verifyToken(accessToken, TokenType.access);

  if (accessTokenValid) {
    req.waiter = {
      waiter_id: accessTokenPayload.waiter_id,
      waiter_email: accessTokenPayload.waiter_email,
      restaurant_id: accessTokenPayload.restaurant_id,
    };
    return next();
  }

  const refreshTokenValid = verifyToken(oldRefreshToken, TokenType.refresh);

  if (refreshTokenValid) {
    req.waiter = {
      waiter_id: accessTokenPayload.waiter_id,
      waiter_email: accessTokenPayload.waiter_email,
      restaurant_id: accessTokenPayload.restaurant_id,
    };

    return next();
  }

  await deleteWaiterRefreshToken(accessTokenPayload.waiter_id);
  return sendResponse(
    res,
    "Your session has expired, please log in again",
    Operation.Forbidden
  );
};
