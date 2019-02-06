import { Router } from "express";
import * as controller from "../controllers/menus";

const router = Router();

// 一覧
router.route("/")
  .get(controller.index);

export default router;
