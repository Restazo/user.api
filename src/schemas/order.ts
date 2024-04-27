import * as z from "zod";

import { OrderItem } from "./localStorage.js";
import { UUID } from "./localStorage.js";

export const OrderResponseToCustomer = z.object({
  orderId: UUID,
  orderStatus: z.enum(["pending", "accepted", "declined"]),
  orderItems: z.array(OrderItem),
});
export type OrderResponseToCustomer = z.infer<typeof OrderResponseToCustomer>;

export const ReviewOrderQuery = z.object({
  action: z.enum(["accept", "decline"]),
});
