import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export const getDeviceIdAndKey = async (req: Request, res: Response) => {
  try {
    // Generate a new UUID for the device ID
    const deviceId = uuidv4();

    // Generate a random secure key for the device
    const key = crypto.randomBytes(32).toString("hex");

    res.json({
      deviceId: deviceId,
      key: key,
    });
  } catch (error) {
    console.error("Error generating device ID and key:", error);
    res.status(500).send("Failed to generate device ID and key");
  }
};

// import { Request, Response } from "express";
// import db from "../db.js";

// export const getDeviceId = async (req: Request, res: Response) => {
//   try {
//     const insertQuery = "INSERT INTO device DEFAULT VALUES RETURNING id;";
//     const result = await db.query(insertQuery);

//     const newDeviceId = result.rows[0].id;

//     res.json({ deviceId: newDeviceId });
//   } catch (error) {
//     console.error("Error generating new device ID:", error);
//     res.status(500).send("Failed to generate a new device ID");
//   }
// };
