import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

export const UUID = z.string().uuid();
export type UUID = z.infer<typeof UUID>;

export const WebSocketConnectionsValue = z.object({
  restaurantId: UUID,
  role: z.enum(["waiter", "customer"]),
});

export type WebSocketConnectionsValue = z.infer<
  typeof WebSocketConnectionsValue
>;

export const WebSocketConnections = z.map(UUID, WebSocketConnectionsValue);
export type WebSocketConnections = z.infer<typeof WebSocketConnections>;

export const UserInstances = z.map(UUID, z.instanceof(WebSocket));
export type UserInstances = z.infer<typeof UserInstances>;

export const WaiterInstances = z.map(UUID, z.instanceof(WebSocket));
export type WaiterInstances = z.infer<typeof WaiterInstances>;

export const WaiterWSConnections = z.map(UUID, WaiterInstances);
export type WaiterWSConnections = z.infer<typeof WaiterWSConnections>;

// Waiter Requests
export const WaiterRequest = z.object({
  tableId: UUID,
  tableLabel: z.string().min(1),
  requestType: z.enum(["waiter", "bill"]),
  createdAt: z.number().min(1).default(Date.now()),
});
export type WaiterRequest = z.infer<typeof WaiterRequest>;
export const WaiterRequestWithoutTime = WaiterRequest.omit({ createdAt: true });
export type WaiterRequestWithoutTime = z.infer<typeof WaiterRequestWithoutTime>;

export const WaiterRequests = z.map(UUID, z.map(UUID, WaiterRequest));
export type WaiterRequests = z.infer<typeof WaiterRequests>;

// Order Requests

export const OrderItem = z.object({
  id: UUID,
  name: z.string().min(1),
  quantity: z.number().int().min(1),
});
export type OrderItem = z.infer<typeof OrderItem>;

const generateUUID = () => uuidv4;

export const OrderRequestWithOrderId = z.object({
  orderId: UUID.default(generateUUID()),
  tableId: UUID,
  deviceId: UUID,
  tableLabel: z.string().min(1),
  orderItems: z.array(OrderItem),
  createdAt: z.number().min(1).default(Date.now()),
});
export type OrderRequestWithOrderId = z.infer<typeof OrderRequestWithOrderId>;

export const OrderRequest = OrderRequestWithOrderId.omit({ orderId: true });
export type OrderRequest = z.infer<typeof OrderRequest>;

export const OrderRequests = z.map(UUID, z.map(UUID, OrderRequest));
export type OrderRequests = z.infer<typeof OrderRequests>;
