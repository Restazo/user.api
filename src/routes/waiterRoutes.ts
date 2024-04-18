import { Router } from "express";

import {
  getSession,
  waiterLogIn,
  waiterLogInConfirm,
  waiterLogOut,
} from "../controllers/waiterController.js";
import { protectWaiterRoute } from "../helpers/protect.js";

const router = Router();

router.post("/login", waiterLogIn);
router.post("/confirm", waiterLogInConfirm);
router.post("/logout", protectWaiterRoute, waiterLogOut);
router.get("/session", protectWaiterRoute, getSession);

export default router;
