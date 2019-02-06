import { Router } from "express";
import * as controller from "../controllers/appSettings";

const router = Router();

router.route("/")
  .get(controller.index);

export default router;
