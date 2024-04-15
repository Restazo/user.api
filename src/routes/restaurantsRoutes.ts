import { Router } from "express";

import {
  getRestaurantsNearYou,
  getMenuItem,
  getRestaurantOverview,
} from "../controllers/restaurantsController.js";

const router = Router();

router.get("/", getRestaurantsNearYou);
router.get("/:restaurantId/menu/:itemId", getMenuItem);
router.get("/:restaurantId", getRestaurantOverview);

export default router;
