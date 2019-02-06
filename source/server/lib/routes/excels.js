import { Router } from "express";
import * as controller from "../controllers/excels";

const router = Router();


// excel形式でダウンロード
router.get("/", controller.index);
router.get("/search", controller.search);
router.post("/search_detail", controller.searchDetail);

export default router;