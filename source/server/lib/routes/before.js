import { Router } from "express";
import * as controller from "../controllers/before";

const router = Router();

router.all("*", controller.verifyToken);

export default router;
