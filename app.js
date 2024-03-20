import express from "express"
import cors from "cors"
import morgan from "morgan"
import "./config.js"

import testRoutes from "./routes/testRoutes.js"

const app = express()

if (process.env.ENV === "dev") {
  console.log("Running in development mode")
  app.use(morgan("dev"))
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

app.use(express.json())

app.use("/test", testRoutes)

app.listen(process.env.API_PORT, () => {
  console.log(`Server is running on port ${process.env.API_PORT}`)
})
