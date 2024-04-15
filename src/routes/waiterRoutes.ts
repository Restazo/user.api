import { Router } from "express";

import {
  waiterLogIn,
  waiterLogInConfirm,
  waiterRegister,
} from "../controllers/waiterController.js";

const router = Router();

router.post("/login", waiterLogIn);
router.post("/register", waiterRegister);
router.post("/confirm", waiterLogInConfirm);

export default router;
