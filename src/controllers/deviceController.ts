import { Request, response, Response } from "express";
import db from "../db.js";
import { sendResponse } from "../helpers/responses.js";
import { Operation } from "../helpers/types/responseMaps.js";

export const getDeviceId = async (req: Request, res: Response) => {
  try {
    const insertQuery = "INSERT INTO device DEFAULT VALUES RETURNING id;";
    const result = await db.query(insertQuery);

    const newDeviceId = result.rows[0].id;

    sendResponse(res, "Successful generating device ID:", Operation.Created, {
      deviceId: newDeviceId,
    });
  } catch (error) {
    console.error("Error generating new device ID:", error);
    sendResponse(res, "Error generating new device ID", Operation.ServerError);
  }
};
