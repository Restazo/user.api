import pool from "../db.js";

import { Table } from "../schemas/types/table.js";
import { TableSchema } from "../schemas/table.js";

export const getTableById = async (id: string) => {
  try {
    const existingTable = await pool.query(
      `SELECT
        rt.id,
        rt.label ,
        rt.restaurant_id AS "restaurantId",
        JSON_BUILD_OBJECT(
          'latitude', (SELECT ra.latitude FROM restaurant_address ra WHERE ra.restaurant_id = r.id),
          'longitude', (SELECT ra.longitude FROM restaurant_address ra WHERE ra.restaurant_id = r.id)
      ) AS "restaurantCoords"
      FROM 
        restaurant_table rt
      JOIN 
        restaurant r ON rt.restaurant_id = r.id
      JOIN
        restaurant_address ra ON r.id = ra.restaurant_id
      WHERE 
        rt.id = $1 AND listed = true
      `,
      [id]
    );

    if (existingTable.rows.length === 0) {
      return null;
    }

    const table = existingTable.rows[0];

    // Validate restaurant before returning it
    const validatedTable = TableSchema.parse(table);

    return validatedTable;
  } catch (error) {
    console.error("Error from getTableById function");
    throw error;
  }
};
