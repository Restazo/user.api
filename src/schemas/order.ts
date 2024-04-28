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

export const MarkOrdersQuery = z.object({
  mark: z.enum(["paid", "unpaid"]),
});

export const OngoingOrdersSnapshotRaw = z.array(
  z.object({
    tableId: UUID,
    tableLabel: z.string().min(1),
    orderId: UUID.nullable(),
    quantity: z.number().nullable(),
    itemId: z.string().nullable(),
    itemName: z.string().nullable(),
  })
);
export type OngoingOrdersSnapshotRaw = z.infer<typeof OngoingOrdersSnapshotRaw>;

export const OngoingOrdersSnapshot = z.object({
  field: z.literal("ongoingOrders"),
  tables: z.array(
    z.object({
      tableId: UUID,
      tableLabel: z.string().min(1),
      orders: z.array(
        z.object({
          orderId: UUID,
          orderItems: z.array(OrderItem),
        })
      ),
    })
  ),
});
export type OngoingOrdersSnapshot = z.infer<typeof OngoingOrdersSnapshot>;
