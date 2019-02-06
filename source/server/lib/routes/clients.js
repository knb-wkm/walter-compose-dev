import { Router } from "express";
import path from "path";

const router = Router();

router.route("/").get((req, res) => {
  res.sendFile(path.join(__dirname, '../../../client/build', 'index.html'));
})

export default router;