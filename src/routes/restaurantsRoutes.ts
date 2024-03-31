import { Router } from "express";

import { getRestaurantsNearYou } from "../controllers/restaurantsController.js";

const router = Router();

router.get("/", getRestaurantsNearYou);

export default router;
