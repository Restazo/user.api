import { Router } from "express";

import { dismissRequest } from "../controllers/waiterController.js";
import { protectWaiterRoute } from "../helpers/protect.js";

const router = Router();

router.delete("/:tableId/dismiss-request", protectWaiterRoute, dismissRequest);

export default router;
