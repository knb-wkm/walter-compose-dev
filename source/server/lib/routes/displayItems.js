import { Router } from "express";
import * as controller from "../controllers/displayItems";

const router = Router();

router.get("/", controller.index);
router.get("/excels", controller.excel);

export default router;
