import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { verifyTableSessionToken } from "../helpers/jwtTools.js";
import { sendResponse } from "../helpers/responses.js";

import { Operation } from "../schemas/responseMaps.js";

import { TableSchema } from "../schemas/table.js";

const tableSessionProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tableSessionToken = req.headers["authorization"]?.split(" ")[1];

  // If no access token
  if (!tableSessionToken) {
    return sendResponse(res, "Invalid session", Operation.Unauthorized);
  }

  // If access token does have the correct payload
  if (!TableSchema.safeParse(jwt.decode(tableSessionToken)).success) {
    return sendResponse(res, "Invalid token", Operation.BadRequest);
  }

  // Verify access token
  const decodedAccessToken = verifyTableSessionToken(tableSessionToken);

  // if we have a valid token
  if (decodedAccessToken.payload) {
    const { id, restaurantId, label, restaurantCoords } =
      decodedAccessToken.payload;

    req.table = {
      id,
      restaurantId,
      label,
      restaurantCoords,
    };

    return next();
  }

  if (decodedAccessToken.expired) {
    return sendResponse(res, "Your session has expired", Operation.Forbidden);
  }

  return sendResponse(res, "Invalid session", Operation.Unauthorized);
};

export default tableSessionProtect;
