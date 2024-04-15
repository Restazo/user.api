import { Router } from "express";

import {
  waiterLogIn,
  waiterLogInConfirm,
  waiterLogOut,
  waiterRegister,
} from "../controllers/waiterController.js";
import { protectWaiterRoute } from "../helpers/protect.js";

const router = Router();

router.post("/login", waiterLogIn);
router.post("/register", waiterRegister);
router.post("/confirm", waiterLogInConfirm);
router.post("/logout", protectWaiterRoute, waiterLogOut);

export default router;
