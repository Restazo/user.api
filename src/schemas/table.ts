import * as z from "zod";

const toNumber = z.number().or(z.string()).pipe(z.coerce.number());

import { CoordsSchema } from "./restaurant.js";
import { OrderItem } from "./localStorage.js";
import { UUID } from "./localStorage.js";

export const TableSchema = z.object({
  id: UUID,
  restaurantId: UUID,
  label: z.string().min(1),
  restaurantCoords: CoordsSchema,
});

export const TableSessionMiddlewareReqSchema = z.object({
  userCoords: CoordsSchema,
});

export const TableSessionReqSchema = z.object({
  deviceId: UUID,
  tableHash: z.string().min(1),
  userCoords: CoordsSchema,
});

export const TableWaiterReqSchema = z.object({
  requestType: z.enum(["waiter", "bill"]),
  userCoords: CoordsSchema,
});

export const TableDecryptedData = CoordsSchema.extend({
  tableId: UUID,
});

export const TableOrderReqSchema = z.object({
  deviceId: UUID,
  userCoords: CoordsSchema,
  orderItems: z.array(OrderItem),
});
