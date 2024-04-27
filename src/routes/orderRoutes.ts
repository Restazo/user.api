import { Router } from "express";

import { reviewOrder } from "../controllers/waiterController.js";
import { protectWaiterRoute } from "../helpers/protect.js";

const router = Router();

router.put("/:orderId", protectWaiterRoute, reviewOrder);

export default router;
