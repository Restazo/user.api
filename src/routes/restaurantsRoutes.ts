import { Router } from "express";

import {
  getRestaurantsNearYou,
  getRestaurantOverview,
} from "../controllers/restaurantsController.js";

const router = Router();

router.get("/", getRestaurantsNearYou);
router.get("/:restaurantId", getRestaurantOverview);

export default router;
