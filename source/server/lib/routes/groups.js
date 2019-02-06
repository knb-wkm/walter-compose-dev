import { Router } from "express";
import * as controller from "../controllers/groups";

const router = Router();

router.route("/")
  .get(controller.index)
  .post(controller.create);

router.route("/:group_id")
  .get(controller.view)
  .delete(controller.remove);

router.route("/:group_id/name").patch(controller.updateName);
router.route("/:group_id/description").patch(controller.updateDescription);
router.route("/:group_id/role_menus").patch(controller.updateRoleMenus);

export default router;
