import { NextFunction, Request, Response } from "express";

import { sendResponse } from "../helpers/responses.js";
import { compareDistance } from "../helpers/compareDistance.js";

import { TableSessionMiddlewareReqSchema } from "../schemas/table.js";
import { Operation } from "../schemas/responseMaps.js";

const verifyLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validatedRequest = TableSessionMiddlewareReqSchema.safeParse(req.body);

  if (!validatedRequest.success) {
    return sendResponse(res, "Invalid request body", Operation.BadRequest);
  }

  const userCoords = validatedRequest.data.userCoords;

  // verify location
  const isWithinRange = compareDistance(
    userCoords,
    req.table!.restaurantCoords
  );

  if (isWithinRange) {
    return next();
  }
  return sendResponse(res, "You are out of restaraunt area", Operation.NotAllowed);
};

export default verifyLocation;
