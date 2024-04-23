import * as z from "zod";

import { MenuSchema } from "./menu.js";

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
