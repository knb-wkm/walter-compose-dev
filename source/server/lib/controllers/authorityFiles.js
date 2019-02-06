import mongoose from "mongoose";
import co from "co";
import morgan from "morgan";
import logger from "../logger";

import * as constants from "../configs/constants";

import AuthorityFile from "../models/AuthorityFile";
import Role from "../models/RoleFile";
import Action from "../models/Action";
import { ValidationError } from "../errors/AppError";

export const files = (req, res, next) => {
  co(function* () {
    try {

      const user_id = res.user._id;

      if(req.body.files === undefined) throw new ValidationError( "files is undefined" );
      const files = req.body.files.filter( id => mongoose.Types.ObjectId.isValid(id) ).map(id => mongoose.Types.ObjectId(id));

      const condition = {
        users: mongoose.Types.ObjectId(user_id),
        files: {$in: files}
      };

      const actions = yield AuthorityFile.getActions(condition);

      res.json({
        status: { success: true },
        body: actions
      });

    } catch (e) {
      logger.error(e);
      let errors = {};
      switch (e.message) {
        case "files is undefined":
          errors.files = "ファイルIDが空のためファイル権限の取得に失敗しました";
        break;
      default:
        errors.unknown = e;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false,message:"ファイル権限の取得に失敗しました", errors }
      });

    }
  });
}
