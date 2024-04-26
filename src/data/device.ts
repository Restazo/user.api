import pool from "../db.js";

import { DeviceIdSchema } from "../schemas/device.js";

export const getDeviceById = async (id: string): Promise<string | null> => {
  try {
    const existingDevice = await pool.query(
      `SELECT id
      FROM device
      WHERE id = $1
      `,
      [id]
    );

    if (!existingDevice.rowCount) {
      return null;
    }

    const deviceId = existingDevice.rows[0].id;

    // Validate restaurant before returning it
    const validatedDeviceId = DeviceIdSchema.parse(deviceId);

    return validatedDeviceId;
  } catch (error) {
    console.error("Error from getDeviceById function");
    throw error;
  }
};
