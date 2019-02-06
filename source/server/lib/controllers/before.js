import co from "co";
import jwt from "jsonwebtoken";
import * as commons from "./commons";
import * as constants from "../configs/constants";
import url from "url";

// models
import User from "../models/User";
import Tenant from "../models/Tenant";
import AuthorityMenu from "../models/AuthorityMenu";

import { SECURITY_CONF } from "../configs/server";

export const verifyToken = (req, res, next) => {
  // jwt.vefifyはasyncかつpromiseを返却しない
  const verifyPromise = (token) => {
    return new Promise( (resolve, reject) => {
      const { secretKey } = SECURITY_CONF.development;

      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });
  };

  co(function* () {
    try {
      const authHeader = req.headers["x-auth-cloud-storage"];
      if (authHeader === undefined ||
          authHeader === null ||
          authHeader === "") throw "token is empty";

      const decoded = yield verifyPromise(authHeader);
      const user = yield User.findById(decoded._id);
      if (user === null) throw "user is empty";

      const _user = user.toObject();
      _user.tenant = yield Tenant.findById(user.tenant_id);

      res.user = _user;

      // TODO:
      // // メニュー権限による制御
      // let requestReferer = "";
      // if(req.headers.referer !== undefined) {
      //   requestReferer = ((url.parse(req.headers.referer)).path.split("/"))[1];
      // }

      // // filesからのリクエストもhomeと同様に扱う
      // if(requestReferer === constants.PERMISSION_FILES) requestReferer = constants.PERMISSION_HOME;

      // const condition = {
      //   $or:[
      //     { users: user._id },
      //     { groups: {$in: user.groups } }
      //   ]
      // };

      // const menus = yield AuthorityMenu.getMenus(condition);

      // let auth = false;
      // menus.forEach( (menu) => {
      //   if(menu.name === requestReferer) auth = true;
      // });
      // if(auth === false) throw "permission denied";

      next();
    }
    // @todo jwt.verifyのエラーを調査する
    catch (e) {

      let errors = {};

      switch (e) {
      case "token is empty":
        errors.token = "トークンが空のため検証に失敗";
        break;
      case "user is empty":
        errors.user = "トークンからユーザ情報を取得したが空のためエラー";
        break;
      case "permission denied":
        errors.permission = "アクセス権限がありません";
        break;
      default:
        if (e.message === "jwt malformed" && e.name === "JsonWebTokenError") {
          errors.token = "トークンの復号処理に失敗";
        } else {
          errors.unknown = commons.errorParser(e);
        }
        break;
      }

      res.status(400).json({
        status: { success: false, message: "トークンの検証に失敗", errors }
      });
    }
  });
};
