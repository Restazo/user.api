import { Router } from "express";

import {
  startSession,
  requestWaiter,
  placeOrder,
  getSession,
} from "../controllers/tableSessionController.js";

import tableSessionProtect from "../middlware/tableSessionProtect.js";
import verifyLocation from "../middlware/verifyLocation.js";

const router = Router();

router.post("/", tableSessionProtect, verifyLocation, getSession);
router.post("/start", startSession);
router.post("/call-waiter", tableSessionProtect, verifyLocation, requestWaiter);
router.post("/order", tableSessionProtect, verifyLocation, placeOrder);

export default router;
