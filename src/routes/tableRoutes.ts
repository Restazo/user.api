import { Router } from "express";

import { dismissRequest, markOrder } from "../controllers/waiterController.js";
import { protectWaiterRoute } from "../helpers/protect.js";

const router = Router();

router.delete("/:tableId/dismiss-request", protectWaiterRoute, dismissRequest);
router.put("/:tableId/orders", protectWaiterRoute, markOrder);

export default router;
