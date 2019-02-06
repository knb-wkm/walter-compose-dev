import { Router } from "express";
import * as controller from "../controllers/elasticsearches";

const router = Router();


// 検索用インデックス更新
router.route("/reindex").post(controller.reIndex);
router.route("/reindex_all").get(controller.reIndexAll);
router.route("/reindex_search_detail").post(controller.reIndexSearchResult);

export default router;