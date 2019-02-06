import { Router } from "express";
import * as controller from "../controllers/authorityMenus";

const router = Router();

// ユーザの権限を取得
router.get("/", controller.index);



export default router;
