import { Router } from "express";
import * as controllers from "../controllers/previews";
const router = Router();

router.route("/:preview_id")
  .get(controllers.image)  // プレビュー画像

export default router;
