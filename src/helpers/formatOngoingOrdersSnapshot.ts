import {
  OngoingOrdersSnapshot,
  OngoingOrdersSnapshotRaw,
} from "../schemas/order.js";

export const formatOngoingOrdersSnapshot = (
  data: OngoingOrdersSnapshotRaw
): OngoingOrdersSnapshot => {
  try {
    console.log(data);
    const formattedData = {
      field: "ongoingOrders",
      tables: [] as any,
    };

    const tableMap = new Map();

    data.forEach((row: any) => {
      const { tableId, tableLabel, orderId, itemId, itemName, quantity } = row;

      // if map doesnt have table yet, add it
      if (!tableMap.has(tableId)) {
        tableMap.set(tableId, {
          tableId,
          tableLabel,
          orders: [],
        });
      }

      // if no order ID return early
      if (orderId === null) {
        return;
      }

      const table = tableMap.get(tableId);
      // Check if tableOrders[] has this orderId
      const orderIndex = table.orders.findIndex(
        (order: any) => order.orderId === orderId
      );

      // If not push this orderID and orderItem
      if (orderIndex === -1) {
        table.orders.push({
          orderId: orderId,
          orderItems: [{ id: itemId, name: itemName, quantity }],
        });
      } else {
        // if it does push order item into existing orderItems array
        table.orders[orderIndex].orderItems.push({
          id: itemId,
          name: itemName,
          quantity,
        });
      }
    });

    formattedData.tables = Array.from(tableMap.values());

    const validatedFormattedData = OngoingOrdersSnapshot.parse(formattedData);

    return validatedFormattedData;
  } catch (error) {
    console.error("formatOngoingOrdersSnapshot");
    throw error;
  }
};
