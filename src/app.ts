import express from "express";
import cors from "cors";
import morgan from "morgan";
import "./config.js";

import restaurantsRoutes from "./routes/restaurantsRoutes.js";
import { sendResponse } from "./helpers/responses.js";
import { Operation } from "./helpers/types/responseMaps.js";

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

app.use(process.env.RESTAURANTS_ENDPOINTS_ROOT, restaurantsRoutes);

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
