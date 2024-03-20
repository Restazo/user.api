import { Router } from "express"

import { testFunction } from "../controllers/testController.js"

const router = Router()

router.get("/", testFunction)

export default router
