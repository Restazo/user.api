import * as z from "zod";

import { OrderItem } from "./localStorage.js";

export const UUID = z.string().uuid();
export type UUID = z.infer<typeof UUID>;

export const OrderResponseToCustomer = z.object({
  orderItems: z.array(OrderItem),
  orderStatus: z.enum(["pending", "accepted", "declined"]),
});

export type OrderResponseToCustomer = z.infer<typeof OrderResponseToCustomer>;
