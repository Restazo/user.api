import pool from "../db.js";

import { UUID } from "../schemas/localStorage.js";

export const markTableOrders = async (
  tableId: UUID,
  paid: boolean
): Promise<boolean> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Mark as paid or unpaid restaurant order table
    const updateQuery = `
      UPDATE restaurant_order
      SET paid = $1, completed = true
      WHERE id IN (SELECT order_id FROM ongoing_order WHERE table_id = $2)
      `;

    const updateResult = await client.query(updateQuery, [
      paid,
      tableId,
    ] as any);

    if (updateResult.rowCount === 0) {
      return false;
    }

    // Delete data from ongoing rrder
    const deleteQuery = `
      DELETE FROM ongoing_order
      WHERE table_id = $1
    `;

    await client.query(deleteQuery, [tableId]);

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error from markTableOrders function");
    throw error;
  } finally {
    client.release();
  }
};
