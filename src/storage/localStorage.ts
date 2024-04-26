import * as z from "zod";
import WebSocket from "ws";
import {
  WebSocketConnections,
  UserInstances,
  WaiterWSConnections,
  WebSocketConnectionsValue,
  UUID,
  WaiterRequest,
  WaiterRequests,
  WaiterRequestWithoutTime,
  OrderItem,
  OrderRequest,
  OrderRequests,
} from "../schemas/localStorage.js";

class LocalStorage {
  private _webSocketConnections: WebSocketConnections;
  private _userInstances: UserInstances;
  private _WaiterWSConnections: WaiterWSConnections;
  private _WaiterRequests: WaiterRequests;
  private _OrderRequests: OrderRequests;

  constructor() {
    this._webSocketConnections = new Map();
    this._userInstances = new Map();
    this._WaiterWSConnections = new Map();
    this._WaiterRequests = new Map();
    this._OrderRequests = new Map();
  }

  // Getters
  webSocketConnections(): WebSocketConnections {
    return new Map(this._webSocketConnections);
  }

  waiterConnections(): WaiterWSConnections {
    return new Map(this._WaiterWSConnections);
  }

  userInstances(): UserInstances {
    return new Map(this._userInstances);
  }

  waiterRequests(): WaiterRequests {
    return new Map(this._WaiterRequests);
  }
  orderRequests(): OrderRequests {
    return new Map(this._OrderRequests);
  }

  getRequestsAndOrdersSnapshot(restaurantId: UUID) {
    const requestsRestaurantMap = this._WaiterRequests.get(restaurantId);
    const ordersRestaurantMap = this._OrderRequests.get(restaurantId);

    let requests: WaiterRequest[] = [];
    let orders: OrderRequest[] = [];

    if (requestsRestaurantMap) {
      requests = Array.from(requestsRestaurantMap.values());
    }

    if (ordersRestaurantMap) {
      orders = Array.from(ordersRestaurantMap.values());
    }

    const snapshot = {
      field: "requests",
      data: {
        requests,
        orders,
      },
    };

    return snapshot;
  }

  

  // **************** ADD METHODS ****************
  // Add to all cnnections Map
  addInWebSocketConnections(deviceId: UUID, data: WebSocketConnectionsValue) {
    // Check if it already exists a connection with this ID
    const existingConnection = this._webSocketConnections.has(deviceId);
    // Check if connection exists
    if (existingConnection) {
      throw new Error("Duplicate key value");
    }
    // Add connection
    this._webSocketConnections.set(deviceId, data);
  }

  // Add to user connections
  addInUserInstances(deviceId: UUID, ws: WebSocket) {
    const existingConnection = this._userInstances.has(deviceId);

    // Check if instance exists
    if (existingConnection) {
      throw new Error("Duplicate key value");
    }
    // Add instance
    this._userInstances.set(deviceId, ws);
  }

  addInWaiterWSConnections(restaurantId: UUID, deviceId: UUID, ws: WebSocket) {
    const existingRestaurantMap = this._WaiterWSConnections.has(restaurantId);

    // Check if restaurant Map already exists
    if (existingRestaurantMap) {
      const waiterInstances = this._WaiterWSConnections.get(restaurantId)!;

      // Check if instance exists
      const existingConnection = waiterInstances.has(deviceId);
      if (existingConnection) {
        throw new Error("Duplicate key value");
      }
      // Add instance
      waiterInstances.set(deviceId, ws);
    } else {
      // Add restaurant map and instance
      const waiterInstance = new Map([[deviceId, ws]]);

      this._WaiterWSConnections.set(restaurantId, waiterInstance);
    }
  }

  setWaiterRequest(restaurantId: UUID, data: WaiterRequest) {
    const existingRestarauntMap = this._WaiterRequests.get(restaurantId);

    // Check if restaurant Map exists
    if (!existingRestarauntMap) {
      // If restaurant map key doesnt exist, add restaurant map and new request
      const newRequest = new Map([[data.tableId, data]]);
      this._WaiterRequests.set(restaurantId, newRequest);
    } else {
      // Check if a request for this table already exists
      const existingTableRequest = existingRestarauntMap.get(data.tableId);

      // If request doesnt exist add it
      if (!existingTableRequest) {
        existingRestarauntMap.set(data.tableId, data);
        return;
      }

      // If request exists as a bill (highest priority) do nothing
      if (existingTableRequest.requestType === "bill") {
        throw new Error("Bill has already been requested");
      }

      // if request exists with type waiter and new request is also waiter do nothing
      if (
        existingTableRequest.requestType === "waiter" &&
        data.requestType === "waiter"
      ) {
        throw new Error("Waiter has already been requested");
      }

      // Overwrite existing request type to "bill"
      existingTableRequest.requestType = "bill";
    }
  }

  // **************** DELETE METHODS ****************
  deleteFromWebSocketConnections(deviceId: UUID) {
    this._webSocketConnections.delete(deviceId);
  }

  deleteFromUserInstances(deviceId: UUID) {
    this._userInstances.delete(deviceId);
  }

  deleteFromWaiterWSConnections(restaurantId: UUID, deviceId: UUID) {
    const existingRestaurantMap = this._WaiterWSConnections.get(restaurantId);

    // if map doesnt exist return early
    if (!existingRestaurantMap) {
      return;
    }

    existingRestaurantMap.delete(deviceId);

    // If the restaurant map is empty after the deletion, delete it too
    if (existingRestaurantMap.size === 0) {
      this._WaiterWSConnections.delete(restaurantId);
    }
  }

  deleteFromWaiterRequests(restaurantId: UUID) {
    this._WaiterRequests.delete(restaurantId);
  }
}

const localStorage = new LocalStorage();

export default localStorage;
