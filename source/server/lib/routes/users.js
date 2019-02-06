import { Router } from "express";
import mongoose from "mongoose";
import co from "co";
import crypto from "crypto";
import User from "../models/User";
import Tenant from "../models/Tenant";
import Group from "../models/Group";
import * as controllers from "../controllers/users";

const router = Router();

router.route("/")
  .get(controllers.index) // 一覧
  .post(controllers.add); // 作成

router.route("/with_groups")
  .get(controllers.getWithGroups)

router.route("/:user_id")
  .get(controllers.view); // 詳細

router.route("/:user_id/groups")
  .post(controllers.addUserToGroup); // 所属グループの追加

router.route("/:user_id/password")
  .patch(controllers.updatePassword);  // パスワード変更

router.route("/:user_id/password_force")
  .patch(controllers.updatePasswordForce); // パスワード変更(管理者)

router.route("/:user_id/enabled")
  .patch(controllers.toggleEnabled);  // 有効/無効

router.route("/:user_id/account_name")
  .patch(controllers.updateAccountName); // アカウント名変更

router.route("/:user_id/name")
  .patch(controllers.updateName); // 表示名変更

router.route("/:user_id/email")
  .patch(controllers.updateEmail);  // メールアドレス変更

router.route("/:user_id/groups")
  .post(controllers.addUserToGroup); // 所属グループの追加

router.route("/:user_id/groups/:group_id")
  .delete(controllers.removeUserOfGroup);  // 所属グループの削除


router.route("/:user_id/role_menus")
  .patch(controllers.updateRoleMenus);  // role_menusの変更

export default router;
