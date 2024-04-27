import pool from "../db.js";

import { OrderRequestWithOrderId } from "../schemas/localStorage.js";
import { UUID } from "../schemas/localStorage.js";

export const registerNewOrder = async (
  restaurantId: UUID,
  orderObject: OrderRequestWithOrderId
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log(orderObject)

    // Insert data in the restaurant_order
    const restaurantOrderQuery = `
      INSERT INTO restaurant_order (id, restaurant_id, created_at)
      VALUES ($1, $2, $3)
    `;
    await client.query(restaurantOrderQuery, [
      orderObject.orderId,
      restaurantId,
      // orderObject.createdAt,
    ] as any);

    // Insert data in the ongoing_orders
    const ongoingTableOrderQuery = `
    INSERT INTO ongoing_order (table_id, restaurant_id, order_id)
    VALUES ($1, $2, $3)
    `;
    await client.query(ongoingTableOrderQuery, [
      orderObject.tableId,
      restaurantId,
      orderObject.orderId,
    ]);

    // insert data into order_items
    for (const orderItem of orderObject.orderItems) {
      const orderItemsQuery = `
      INSERT INTO order_item (order_id, item_id, amount)
      VALUES($1, $2, $3)
      `;

      await client.query(orderItemsQuery, [
        orderObject.orderId,
        orderItem.id,
        orderItem.quantity,
      ] as any);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error from registerNewOrder function");
    throw error;
  } finally {
    client.release();
  }
};
