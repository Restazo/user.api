import { Request, Response } from "express";

import localStorage from "../storage/localStorage.js";

import { sendResponse } from "../helpers/responses.js";
import logger from "../helpers/logger.js";
import { verifyOrderItems } from "../helpers/verifyOrderItems.js";
import { signTableSessionToken } from "../helpers/jwtTools.js";
import { compareDistance } from "../helpers/compareDistance.js";
import decrypt from "../lib/decrypt.js";

import { getTableById } from "../data/table.js";
import { getDeviceById } from "../data/device.js";
import { getRestaurantById } from "../data/restaurant.js";

import { Operation } from "../schemas/responseMaps.js";
import {
  TableDecryptedData,
  TableSessionReqSchema,
  TableWaiterReqSchema,
  TableOrderReqSchema,
} from "../schemas/table.js";
import {
  WaiterRequest,
  OrderRequestWithOrderId,
} from "../schemas/localStorage.js";

export const startSession = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedRequest = TableSessionReqSchema.safeParse(req.body);
    if (!validatedRequest.success) {
      return sendResponse(res, "Invalid request body", Operation.BadRequest);
    }

    const { tableHash, deviceId, userCoords } = validatedRequest.data;

    // Decipher table data
    const decryptedTableData = decrypt(tableHash);

    // validate tableData from decrypt
    const validatedTable = TableDecryptedData.safeParse(decryptedTableData);

    if (!validatedTable.success) {
      return sendResponse(res, "Invalid table hash", Operation.BadRequest);
    }

    const { tableId, ...tableCoords } = validatedTable.data;

    // compare initial coordinates
    const isWithinRange = compareDistance(userCoords, tableCoords);

    if (!isWithinRange) {
      return sendResponse(res, "User is out of range", Operation.NotAllowed);
    }

    const existingDevice = await getDeviceById(deviceId);

    if (!existingDevice) {
      return sendResponse(
        res,
        "Device ID is not registered",
        Operation.NotFound
      );
    }

    // query database to verify if table still exists
    const existingTable = await getTableById(tableId);

    if (!existingTable) {
      return sendResponse(res, "Table not found", Operation.NotFound);
    }

    // *TODO* RETURN RESTAURANT NAME, LOGO

    const restaurantData = await getRestaurantById(existingTable.restaurantId);

    const returnData = {
      restaurantName: restaurantData!.name,
      restaurantLogo: restaurantData!.logoImage,
      restaurantId: restaurantData!.id,
    };

    // Create table session token and set it on header
    const { tableSessionToken } = signTableSessionToken(existingTable);
    res.setHeader("Authorization", `Bearer ${tableSessionToken}`);

    return sendResponse(
      res,
      "Successfully started table session",
      Operation.Ok,
      returnData
    );
  } catch (error) {
    logger("Failed to start table session", error);

    return sendResponse(res, "Something went wrong", Operation.ServerError);
  }
};

export const requestWaiter = async (req: Request, res: Response) => {
  try {
    const validatedRequest = TableWaiterReqSchema.safeParse(req.body);

    if (!validatedRequest.success) {
      return sendResponse(res, "Invalid request body", Operation.BadRequest);
    }

    const { requestType } = validatedRequest.data;
    const { restaurantId, label } = req.table!;

    const newRequest = {
      tableId: req.table!.id,
      tableLabel: req.table!.label,
      requestType: requestType,
    };

    const validatedNewRequest = WaiterRequest.parse(newRequest);

    try {
      await localStorage.setWaiterRequest(restaurantId, validatedNewRequest);
    } catch (error: any) {
      if (error instanceof Error && error.message) {
        return sendResponse(res, error.message, Operation.Conflict);
      }
      throw error;
    }

    const connectedWaiters = localStorage.waiterConnections().get(restaurantId);

    if (connectedWaiters) {
      const snapshot = localStorage.getRequestsAndOrdersSnapshot(restaurantId);
      // Message all waiters connected
      const message = JSON.stringify(snapshot);

      connectedWaiters.forEach((ws) => {
        ws.send(message);
      });
    }

    return sendResponse(res, "Successfully requested a waiter", Operation.Ok);
  } catch (error) {
    logger("Failed to request waiter", error);
    return sendResponse(res, "Something went wrong", Operation.ServerError);
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const validatedRequest = TableOrderReqSchema.safeParse(req.body);

    if (!validatedRequest.success) {
      console.log(validatedRequest.error);
      return sendResponse(res, "Invalid request body", Operation.BadRequest);
    }

    const { orderItems, deviceId } = validatedRequest.data;

    // verify oder itemIDs... Currently not verifying name ***TODO****
    const existingItems = await verifyOrderItems(orderItems);

    if (!existingItems) {
      return sendResponse(res, "No order items found", Operation.BadRequest);
    }
    const { restaurantId, ...tableSession } = req.table!;

    const orderRequestObject = {
      tableId: tableSession.id,
      tableLabel: tableSession.label,
      deviceId: deviceId,
      orderItems: orderItems,
    };

    const validatedOrderObject =
      OrderRequestWithOrderId.parse(orderRequestObject);

    // add order to local storage
    localStorage.addOrderRequest(restaurantId, validatedOrderObject);

    const connectedWaiters = localStorage.waiterConnections().get(restaurantId);

    if (connectedWaiters) {
      const snapshot = localStorage.getRequestsAndOrdersSnapshot(restaurantId);
      // Message all waiters connected
      const message = JSON.stringify(snapshot);

      connectedWaiters.forEach((ws) => {
        ws.send(message);
      });
    }

    const returnObject = {
      orderId: validatedOrderObject.orderId,
      orderItems: validatedOrderObject.orderItems,
    };

    return sendResponse(
      res,
      "Successfully placed order",
      Operation.Ok,
      returnObject
    );
  } catch (error) {
    logger("Failed to place order", error);
    return sendResponse(res, "Something went wrong", Operation.ServerError);
  }
};

export const getSession = async (req: Request, res: Response) => {
  const restaurantData = await getRestaurantById(req.table!.restaurantId);

  const returnData = {
    restaurantName: restaurantData!.name,
    restaurantLogo: restaurantData!.logoImage,
    restaurantId: restaurantData!.id,
  };

  return sendResponse(res, "Nice session", Operation.Ok, returnData);
};
