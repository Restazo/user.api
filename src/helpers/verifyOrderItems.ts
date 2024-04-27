import pool from "../db.js";

import { OrderItem } from "schemas/localStorage.js";

export const verifyOrderItems = async (
  itemsArray: OrderItem[]
): Promise<boolean> => {
  const client = await pool.connect();
  try {
    const itemIds = itemsArray.map((item) => item.id);

    const query = `
      SELECT id
      FROM menu_item
      WHERE id = ANY($1)
      `;

    const result = await client.query(query, [itemIds]);

    return result.rows.length === new Set(itemIds).size;
  } catch (error) {
    console.error("Error from verifyOrderItems function");
    throw error;
  } finally {
    client.release();
  }
};
