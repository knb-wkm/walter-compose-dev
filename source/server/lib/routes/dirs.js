import { Router } from "express";
import * as controllers from "../controllers/dirs";
const router = Router();

router.route("/")
  .get(controllers.index)   // ディレクトリの階層
  .post(controllers.create);  // 作成

// ディレクトリのツリー(以下みたいなやつ)
//   root --- folder1 -- folder1-1
//         |- folder2
//         |- folder3 -- folder3-1
router.route("/tree").get(controllers.tree);

router.route("/:dir_id")
  .get(controllers.view); // ディレクトリの詳細

// フォルダ移動
router.route("/:moving_id/move").patch(controllers.move);

export default router;
