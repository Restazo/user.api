import WebSocket from "ws";

import localStorage from "../../storage/localStorage.js";

import { sendWSResponse } from "../../helpers/responses.js";
import { verifyTableSessionToken } from "../../helpers/jwtTools.js";
import logger from "../../helpers/logger.js";

import { getExistingCustomerOrder } from "../../data/order.js";

import { Operation } from "../../schemas/responseMaps.js";
import { WebSocketConnectionsValue } from "schemas/localStorage.js";
import { TableSessionJwtPayload } from "../../schemas/types/table.js";

export const subsribeToOrder = async (
  ws: WebSocket,
  accessToken: string,
  deviceId: string,
  orderId: string
) => {
  try {
    const tableSession = await tableSessionProtect(ws, accessToken);

    if (!tableSession) {
      return;
    }

    const { restaurantId } = tableSession;

    // Check if order exists
    const existingOrder = await getExistingCustomerOrder(orderId, restaurantId);

    const orderStatus = existingOrder.orderStatus;

    if (orderStatus !== "pending") {
      if (orderStatus === "declined") {
        return sendWSResponse(
          ws,
          "The restaurant has declined your order",
          Operation.Ok,
          existingOrder
        );
      }
      return sendWSResponse(
        ws,
        "The restaurant has accepted your order",
        Operation.Ok,
        existingOrder
      );
    }

    const existingConnection = await localStorage
      .webSocketConnections()
      .get(deviceId);

    if (!existingConnection) {
      // Create new connetion object data
      const newConnectionData: WebSocketConnectionsValue = {
        restaurantId: restaurantId,
        role: "customer",
      };

      // insert data in allconnections localstorage
      localStorage.addInWebSocketConnections(deviceId, newConnectionData);

      // Check if user exists in userInstances
      if (!localStorage.userInstances().get(deviceId)) {
        // add user if not
        await localStorage.addInUserInstances(deviceId, ws);
      }
    }

    return sendWSResponse(
      ws,
      "The restaurant is reviewing your order",
      Operation.Ok,
      existingOrder
    );
  } catch (error) {
    logger("Failed to subscribe to order", error);
    return sendWSResponse(
      ws,
      "Failed to subscribed to order",
      Operation.ServerError
    );
  }
};

// *********************************** PROTECT FUNCTION ***********************************
const tableSessionProtect = async (
  ws: WebSocket,
  tableSessionToken: string
): Promise<TableSessionJwtPayload | void> => {
  // Verify access token
  const decodedAccessToken = verifyTableSessionToken(tableSessionToken);

  // if we have a valid token
  if (decodedAccessToken.payload) {
    return decodedAccessToken.payload;
  }

  if (decodedAccessToken.expired) {
    return sendWSResponse(ws, "Your session has expired", Operation.Forbidden);
  }

  return sendWSResponse(ws, "Invalid session", Operation.BadRequest);
};
