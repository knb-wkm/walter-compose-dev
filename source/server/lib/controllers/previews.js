import mongoose from "mongoose";
import co from "co";
import { logger } from "../logger";

// models
import Preview from "../models/Preview";

export const image = (req, res, next) => {
  co(function* () {
    try {
      const { preview_id } = req.params;

      const preview = yield Preview.findById(preview_id);

      res.json({
        status: { success: true },
        body: preview.image.buffer.toString("base64")
      });

    } catch (e) {
      logger.error(e);
      res.status(404).send('Not Found');
    }
  });
}
