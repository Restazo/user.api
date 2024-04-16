import { Router } from "express";

import {
  renewSession,
  waiterLogIn,
  waiterLogInConfirm,
  waiterLogOut,
  waiterRegister,
} from "../controllers/waiterController.js";
import { protectWaiterRoute } from "../helpers/protect.js";

const router = Router();

router.post("/login", waiterLogIn);
router.post("/confirm", waiterLogInConfirm);
router.post("/logout", protectWaiterRoute, waiterLogOut);
router.post("/renew", protectWaiterRoute, renewSession);
// TODO: delete this route
router.post("/register", waiterRegister);

export default router;
