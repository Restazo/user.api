import { Router } from "express";

import {
  getRestaurantsNearYou,
  getMenuItem,
} from "../controllers/restaurantsController.js";

const router = Router();

router.get("/", getRestaurantsNearYou);
router.get("/:restaurantId/menu/:itemId", getMenuItem);

export default router;
