import { Router } from "express";

import {
  waiterLogIn,
  waiterRegister,
} from "../controllers/waiterController.js";

const router = Router();

router.post("/login", waiterLogIn);
router.post("/register", waiterRegister);

export default router;
