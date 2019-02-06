import { Router } from "express";
import * as controller from "../controllers/roleMenus";

const router = Router();

// 一覧,作成
router.route("/")
.get(controller.index)
.post(controller.create)
;

// 詳細,削除
router.route("/:role_id")
  .get(controller.view)
  .delete(controller.remove);

// 名前変更
router.route("/:role_id/name")
  .patch(controller.updateName);

// 備考変更
router.route("/:role_id/description")
.patch(controller.updateDescription);

// menu追加,削除
router.route("/:role_id/menus/:menu_id")
  .patch(controller.addMenuToRoleMenu)
  .delete(controller.removeMenuOfRoleMenu);

export default router;