import { Router } from "express";
import * as controller from "../controllers/authorityFiles";

const router = Router();

// 選択したファイルの権限を取得
router.post("/files", controller.files);


export default router;
