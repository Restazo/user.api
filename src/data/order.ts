import pool from "../db.js";
import localStorage from "../storage/localStorage.js";

import { OrderResponseToCustomer } from "../schemas/order.js";

export const getOngoingOrderById = async (id: string) => {
  try {
    const existingTable = await pool.query(
      `
      SELECT *
      FROM ongoing_table_orders
      WHERE order_id = $1
      `,
      [id]
    );

    if (existingTable.rows.length === 0) {
      return null;
    }

    const order = existingTable.rows[0];

    // // Validate restaurant before returning it
    // const validatedTable = TableSchema.parse(table);

    return order;
  } catch (error) {
    console.error("Error from getOngoingOrderById function");
    throw error;
  }
};

export const getExistingCustomerOrder = async (
  orderId: string,
  restaurantId: string
): Promise<OrderResponseToCustomer> => {
  try {
    let orderItems: any[] = [];
    let orderStatus: string = "";

    const pendingOrders = localStorage.orderRequests().get(restaurantId);
    if (pendingOrders) {
      const order = pendingOrders.get(orderId);
      if (order) {
        orderItems = order.orderItems;
        orderStatus = "pending";
      }
    }

    if (!orderItems.length) {
      const query = `
     SELECT 
      oi.item_id AS "itemId",
      mi.name AS "itemName",
      oi.quantity 
     FROM 
      order_item AS oi
     JOIN
      menu_item AS mi ON oi.item_id = mi.id
     WHERE order_id = $1
     `;

      const result = await pool.query(query, [orderId]);

      if (result.rows.length === 0) {
        orderStatus = "declined";
      } else {
        orderItems = result.rows;
        orderStatus = "accepted";
      }
    }

    const validatedResult = OrderResponseToCustomer.parse({
      orderId,
      orderItems,
      orderStatus,
    });

    return validatedResult;
  } catch (error) {
    console.error("Error from getExistingCustomerOrder function");
    throw error;
  }
};
