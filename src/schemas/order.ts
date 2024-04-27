import * as z from "zod";

import { OrderItem } from "./localStorage.js";
import { UUID } from "./localStorage.js";

export const OrderResponseToCustomer = z.object({
  orderItems: z.array(OrderItem),
  orderStatus: z.enum(["pending", "accepted", "declined"]),
});
export type OrderResponseToCustomer = z.infer<typeof OrderResponseToCustomer>;

export const ReviewOrderQuery = z.object({
  action: z.enum(["accept", "decline"]),
});
