import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import pool from "../db.js";

import { sendResponse } from "./responses.js";
import { TokenType, verifyToken } from "./jwtTools.js";
import { deleteWaiterRefreshToken } from "../lib/waiter.js";

import { waiterAuthTokensPayload } from "../schemas/waiter.js";
import { Operation } from "../schemas/responseMaps.js";

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

  const payloadVerified = waiterAuthTokensPayload.safeParse(accessTokenPayload);

  if (!payloadVerified.success) {
    return sendResponse(res, "Invalid token", Operation.BadRequest);
  }

  const result = await pool.query(
    `SELECT refresh_token as "refreshToken", id FROM waiter WHERE id = $1;`,
    [accessTokenPayload.waiterId]
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
      waiterId: accessTokenPayload.waiterId,
      waiterEmail: accessTokenPayload.waiterEmail,
      restaurantId: accessTokenPayload.restaurantId,
      waiterName: accessTokenPayload.waiterName,
    };
    return next();
  }

  const refreshTokenValid = verifyToken(oldRefreshToken, TokenType.refresh);

  if (refreshTokenValid) {
    req.waiter = {
      waiterId: accessTokenPayload.waiterId,
      waiterEmail: accessTokenPayload.waiterEmail,
      restaurantId: accessTokenPayload.restaurantId,
      waiterName: accessTokenPayload.waiterName,
    };

    return next();
  }

  await deleteWaiterRefreshToken(accessTokenPayload.waiterId);
  return sendResponse(
    res,
    "Your session has expired, please log in again",
    Operation.Forbidden
  );
};
