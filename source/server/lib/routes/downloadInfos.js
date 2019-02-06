import { Router } from "express";
import * as controller from "../controllers/downloadInfos";

const router = Router();

router.post("/", controller.add);
router.put("/:downloadinfo_id/update", controller.update);
router.get("/:downloadinfo_type", controller.index);

export default router;
