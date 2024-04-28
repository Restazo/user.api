import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import * as z from "zod";

import "./config.js";
import localStorage from "./storage/localStorage.js";

import { subsribeToRestaurant } from "./controllers/WSControllers/waiterController.js";
import { subsribeToOrder } from "./controllers/WSControllers/customerController.js";

import { sendWSResponse } from "./helpers/responses.js";
import { deleteConnection } from "./lib/deleteWSConnection.js";

import { getDeviceById } from "./data/device.js";

import { Operation } from "./schemas/responseMaps.js";
import { DeviceIdSchema } from "./schemas/device.js";
import { WSMessageReqSchema } from "./schemas/wsMessage.js";
import { waiterAuthTokensPayload } from "./schemas/waiter.js";
import { TableSchema } from "./schemas/table.js";

const port = Number(process.env.WEBSOCKET_PORT);

const wss = new WebSocketServer({
  port,
});

wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
  const accessToken = req.headers["authorization"]?.split(" ")[1];

  if (!accessToken) {
    await sendWSResponse(ws, "Invalid session", Operation.BadRequest);
    return ws.close();
  }

  const accessTokenPayload = jwt.decode(accessToken);

  const validatedAccessToken = z
    .union([waiterAuthTokensPayload, TableSchema])
    .safeParse(accessTokenPayload);

  if (!validatedAccessToken.success) {
    await sendWSResponse(ws, "Invalid session", Operation.Unauthorized);
    return ws.close();
  }

  const { restaurantId } = validatedAccessToken.data;

  // check if deviceId or accessToken is provided
  if (!req.headers.deviceid) {
    // send message missing deviceID
    await sendWSResponse(ws, "Invalid request", Operation.BadRequest);
    return ws.close();
  }

  const validatedDeviceId = DeviceIdSchema.safeParse(req.headers.deviceid);

  if (!validatedDeviceId.success) {
    await sendWSResponse(ws, "Invalid request", Operation.NotFound);
    return ws.close();
  }

  // verify if device has been registered on database
  const existingDevice = await getDeviceById(validatedDeviceId.data);

  if (!existingDevice) {
    await sendWSResponse(ws, "No registered device found", Operation.NotFound);
    return ws.close();
  }

  const connectedDevice = existingDevice;

  ws.on("message", async (message: Buffer) => {
    try {
      const validatedRequest = WSMessageReqSchema.safeParse(
        JSON.parse(message.toString())
      );

      if (!validatedRequest.success) {
        return sendWSResponse(ws, "Invalid request", Operation.NotFound);
      }

      const data = validatedRequest.data;

      // Subsribe to restaurant handler
      switch (data.path) {
        case "/subscribe/order":
          // call subscribe controller
          await subsribeToOrder(
            ws,
            data.payload.accessToken.split(" ")[1],
            connectedDevice,
            data.payload.orderId
          );
          break;
        case "/subscribe/restaurant":
          await subsribeToRestaurant(
            ws,
            data.payload.accessToken.split(" ")[1],
            connectedDevice
          );
      }
    } catch (error) {
      console.error(error);
      return sendWSResponse(ws, "Something went wrong", Operation.ServerError);
    }
  });

  ws.on("close", async (ws: WebSocket, req) => {
    await deleteConnection(connectedDevice, restaurantId);
  });
});

console.log(`Websocket Server is running on port ${port}`);

export default wss;
