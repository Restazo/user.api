import * as z from "zod";

const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const latitude = toNumber.refine((value) => value >= -90 && value <= 90);
const longitude = toNumber.refine((value) => value >= -180 && value <= 180);

import { CoordsSchema } from "./restaurant.js";

export const TableSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid(),
  label: z.string().min(1),
  restaurantCoords: CoordsSchema,
});



export const TableSessionMiddlewareReqSchema = z.object({
  userCoords: CoordsSchema,
});

export const TableSessionReqSchema = z.object({
  deviceId: z.string().uuid(),
  tableHash: z.string().min(1),
  userCoords: CoordsSchema,
});

export const TableWaiterReqSchema = z.object({
  requestType: z.enum(["waiter", "bill"]),
  userCoords: CoordsSchema,
});

export const TableDecryptedData = CoordsSchema.extend({
  tableId: z.string().uuid(),
});

const OrderItem = z.object({
  itemId: z.string().uuid(),
  amount: z.number().int().min(1),
});

export const TableOrderReqSchema = z.object({
  userCoords: CoordsSchema,
  order: z.array(OrderItem),
});
