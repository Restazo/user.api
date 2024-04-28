import express from "express";
import cors from "cors";
import morgan from "morgan";
import "./config.js";
import "./wsapp.js";

import restaurantsRoutes from "./routes/restaurantsRoutes.js";
import { sendResponse } from "./helpers/responses.js";
import { Operation } from "./schemas/responseMaps.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import waiterRoutes from "./routes/waiterRoutes.js";
import tableSessionRoutes from "./routes/tableSessionRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";

const app = express();

if (process.env.ENV === "dev") {
  console.log("Running in development mode");
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

import { getOngoingOrdersSnapshot } from "./data/order.js";
app.use("/test", async (req, res) => {
  const id = "e8226847-064b-4be8-bac3-d4151e07bbad";
  const data = await getOngoingOrdersSnapshot(id);
  console.log(JSON.stringify(data, null, 2))
 
  res.send("ok");
});


app.use(process.env.RESTAURANTS_ENDPOINTS_ROOT, restaurantsRoutes);
app.use("/device_id", deviceRoutes);
app.use("/waiter", waiterRoutes);
app.use("/table-session", tableSessionRoutes);
app.use("/order", orderRoutes);
app.use("/tables", tableRoutes);

// Respond if none of the endpoints matched
app.all("*", (req, res, next) => {
  sendResponse(
    res,
    `No ${req.method} method for ${req.originalUrl} route on the server`,
    Operation.NotFound
  );
});

app.listen(process.env.API_PORT, () => {
  console.log(`Server is running on port ${process.env.API_PORT}`);
});
