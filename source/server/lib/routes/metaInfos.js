import { Router } from "express";
import * as controllers from "../controllers/metaInfos";
const router = Router();

router.route("/")
  .get(controllers.index) // 一覧
  .post(controllers.add); // 作成

router.route("/value_type")
  .get(controllers.valueType); // データ型一覧

router.route("/:metainfo_id")
  .get(controllers.view);  // 詳細

router.route("/:metainfo_id/label")
  .patch(controllers.updateLabel);  // 表示名更新

router.route("/:metainfo_id/name")
  .patch(controllers.updateName);  // 表示名更新

export default router;
