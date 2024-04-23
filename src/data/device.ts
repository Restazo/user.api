import pool from "../db.js";

import * as z from "zod";

import { Table } from "../schemas/types/table.js";
import { TableSchema } from "../schemas/table.js";

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

    const deviceId = existingDevice.rows[0];

    // Validate restaurant before returning it
    const validatedTable = z.string().uuid().parse(deviceId);

    return deviceId;
  } catch (error) {
    console.error("Error from getTableById function");
    throw error;
  }
};
