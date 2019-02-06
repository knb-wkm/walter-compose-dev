import { Router } from "express";
import * as controller from "../controllers/analysis";

const router = Router();

router.route("/").get(controller.index);
router.route("/periods").get(controller.periods);

export default router;
