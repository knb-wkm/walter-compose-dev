import { Router } from "express";
import * as controller from "../controllers/login";

const router = Router();

router.route("/").post(controller.authentication);
router.route("/verify_token").post(controller.verifyToken);

export default router;
