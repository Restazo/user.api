import WebSocket from "ws";
import jwt from "jsonwebtoken";

import localStorage from "../../storage/localStorage.js";
import pool from "../../db.js";

import { sendWSResponse } from "../../helpers/responses.js";
import logger from "../../helpers/logger.js";
import { TokenType, verifyToken } from "../../helpers/jwtTools.js";
import { deleteWaiterRefreshToken } from "../../lib/waiter.js";
import { sendSnapshotToWaiters } from "../../lib/sendWSMessage.js";

import { Operation } from "../../schemas/responseMaps.js";
import { WaiterRequestObj } from "../../schemas/types/waiter.js";
import { WebSocketConnectionsValue } from "schemas/localStorage.js";
import { waiterAuthTokensPayload } from "../../schemas/waiter.js";

export const subsribeToRestaurant = async (
  ws: WebSocket,
  accessToken: string,
  deviceId: string
) => {
  try {
    const isValidSession = await protectWaiterRoute(ws, accessToken);

    if (!isValidSession) {
      await sendWSResponse(ws, "Invalid session", Operation.Unauthorized);
      return ws.close();
    }

    const waiter = isValidSession;

    const existingConnection = await localStorage
      .webSocketConnections()
      .get(deviceId);

    if (!existingConnection) {
      // Create new object data
      const newConnectionData: WebSocketConnectionsValue = {
        restaurantId: waiter.restaurantId,
        role: "waiter",
      };

      // insert data in localstorage
      localStorage.addInWebSocketConnections(deviceId, newConnectionData);

      if (!localStorage.waiterConnections().get(waiter.restaurantId)) {
        await localStorage.addInWaiterWSConnections(
          waiter.restaurantId,
          deviceId,
          ws
        );
      }
    }

    // Return ALL requests pending (waiter calls/ pending orders/ )

    await sendSnapshotToWaiters(waiter.restaurantId, "ongoing");
    await sendSnapshotToWaiters(waiter.restaurantId, "requests");

    return sendWSResponse(ws, "Successfully subscribed", Operation.Ok);
  } catch (error) {
    logger("Failed to subscribe to restaurant", error);
    return sendWSResponse(
      ws,
      "Failed to subscribed to restaurant",
      Operation.ServerError
    );
  }
};

// *********************************** PROTECT FUNCTION ***********************************
const protectWaiterRoute = async (
  ws: WebSocket,
  accessToken: string
): Promise<WaiterRequestObj | void> => {
  const accessTokenPayload: any = jwt.decode(accessToken);

  const payloadVerified = waiterAuthTokensPayload.safeParse(accessTokenPayload);

  if (!payloadVerified.success) {
    return sendWSResponse(ws, "Invalid token", Operation.BadRequest);
  }

  const verifiedPayload = payloadVerified.data;

  const result = await pool.query(
    `SELECT refresh_token as "refreshToken", id FROM waiter WHERE id = $1;`,
    [verifiedPayload.waiterId]
  );

  if (result.rowCount === 0) {
    return sendWSResponse(ws, "Invalid token", Operation.BadRequest);
  }
  const oldRefreshToken = result.rows[0].refreshToken;

  if (oldRefreshToken === null) {
    return sendWSResponse(
      ws,
      "You are logged out, please log in",
      Operation.Forbidden
    );
  }

  const accessTokenValid = verifyToken(accessToken, TokenType.access);

  if (accessTokenValid) {
    const payload = verifiedPayload;

    return payload;
  }

  const refreshTokenValid = verifyToken(oldRefreshToken, TokenType.refresh);

  if (refreshTokenValid) {
    const payload = verifiedPayload;

    return payload;
  }

  await deleteWaiterRefreshToken(verifiedPayload.waiterId);
  return sendWSResponse(
    ws,
    "Your session has expired, please log in again",
    Operation.Forbidden
  );
};
