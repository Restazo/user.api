import { getDeviceIdAndKey } from "../controllers/deviceController.js";
import { Router } from "express";


const router = Router();

router.get("/", getDeviceIdAndKey);

export default router;
