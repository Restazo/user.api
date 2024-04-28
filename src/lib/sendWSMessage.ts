import { sendWSResponse } from "../helpers/responses.js";

import { getOngoingOrdersSnapshot } from "../data/order.js";

import { UUID } from "../schemas/localStorage.js";

import localStorage from "../storage/localStorage.js";

export const sendSnapshotToWaiters = async (
  restaurantId: UUID,
  type: "requests" | "ongoing"
) => {
  try {
    const connectedWaiters = localStorage
      .waiterConnections()
      .get(restaurantId);

    if (connectedWaiters) {
      let snapshot = "" as any;

      if (type === "requests") {
        snapshot = localStorage.getRequestsAndOrdersSnapshot(restaurantId);
      } else {
        snapshot = await getOngoingOrdersSnapshot(restaurantId);
      }

      // Message all waiters connected
      const message = JSON.stringify(snapshot);

      connectedWaiters.forEach(async (ws) => {
        await ws.send(message);
      });
    }
  } catch (error) {
    console.error("Error from sendSnapshotToWaiters function");
    throw error;
  }
};
