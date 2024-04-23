import { NextFunction, Request, Response } from "express";

import { verifyTableSessionToken } from "../helpers/jwtTools.js";
import { sendResponse } from "../helpers/responses.js";

import { TableSessionMiddlewareReqSchema } from "schemas/table.js";
import { Operation } from "../schemas/responseMaps.js";

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
