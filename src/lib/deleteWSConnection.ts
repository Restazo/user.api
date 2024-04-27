import localStorage from "../storage/localStorage.js";

export const deleteConnection = async (
  connectedDevice: string,
  restaurantId: string
) => {
  const existingConnection = localStorage
    .webSocketConnections()
    .get(connectedDevice);

  if (existingConnection) {
    const userRole = existingConnection.role;

    if (userRole === "customer") {
      await localStorage.deleteFromUserInstances(connectedDevice);
    } else {
      await localStorage.deleteFromWaiterWSConnections(
        restaurantId,
        connectedDevice
      );
    }

    localStorage.deleteFromWebSocketConnections(connectedDevice);
  }
};
