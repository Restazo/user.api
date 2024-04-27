import { Router } from "express";

import {
  startSession,
  requestWaiter,
  placeOrder,
} from "../controllers/tableController.js";

import tableSessionProtect from "../middlware/tableSessionProtect.js";
import verifyLocation from "../middlware/verifyLocation.js";

const router = Router();

router.post("/start", startSession);
router.post("/call-waiter", tableSessionProtect, verifyLocation, requestWaiter);
router.post("/order", tableSessionProtect, verifyLocation, placeOrder);

export default router;
