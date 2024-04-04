import { getDeviceId } from "../controllers/deviceController.js";
import { Router } from "express";

const router = Router();

router.get("/", getDeviceId);

export default router;
