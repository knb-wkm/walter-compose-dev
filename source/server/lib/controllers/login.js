import co from "co";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import util from "util";
import * as commons from "./commons";
import { SECURITY_CONF } from "../configs/server";
import User from "../models/User";
import Tenant from "../models/Tenant";
import AppSetting from "../models/AppSetting";
import { checkFilePermission } from "./files";
import * as constants from "../configs/constants";

export const authentication = (req, res, next) => {
  co(function* () {
    try {
      const { account_name, password, tenant_name } = req.body;

      if (account_name === undefined ||
          account_name === null ||
          account_name === "") throw "account_name is empty";

      if (password === undefined ||
          password === null ||
          password === "") throw "password is empty";

      if (tenant_name === undefined ||
          tenant_name === null ||
          tenant_name === "") throw "tenant_name is empty";

      const tenant = yield Tenant.findOne({ name: tenant_name });

      if (tenant === null) throw "tenant is empty";

      const user = yield User.findOne({ account_name, tenant_id: tenant._id });

      if (user === null) throw "user is empty";

      if (user.enabled === false) throw "user is disabled";

      const hash = crypto.createHash("sha512").update(password).digest("hex");

      if (user.password !== hash) throw "password is invalid";

      const _tenant = { ...tenant.toObject()}
      _tenant.trash_icon_visibility = yield checkFilePermission(_tenant.trash_dir_id, { ...user.toObject() }._id, constants.PERMISSION_VIEW_LIST);  //ごみ箱アイコンの表示権限有無

      const _user = { ...user.toObject(), tenant: _tenant };
      delete _user.password;

      const { secretKey, expiresIn } = SECURITY_CONF.development;
      const token = jwt.sign(_user, secretKey, { expiresIn });

      res.json({
        status: { success: true, message: "ユーザ認証に成功しました" },
        body: { token, user: _user }
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "account_name is empty":
        errors.account_name = "アカウント名が空のためユーザ認証に失敗しました";
        break;
      case "password is empty":
        errors.password = "パスワードが空のためユーザ認証に失敗しました";
        break;
      case "user is empty":
        errors.account_name = "アカウント名またはパスワードが不正のため認証に失敗しました";
        break;
      case "password is invalid":
        errors.password = "アカウント名またはパスワードが不正のため認証に失敗しました";
        break;
      case "user is disabled":
        errors.account_name = "指定されたユーザは現在無効状態のためユーザ認証に失敗しました";
        break;
      case "tenant_name is empty":
        errors.tenant_name = "テナント名が空のためユーザ認証に失敗しました";
        break;
      case "tenant is empty":
        errors.tenant_name = "指定されたテナントが存在しないためユーザ認証に失敗しました";
        break;
      default:
        errors.unknown = commons.errorParser(e);
        break;
      }
      res.status(400).json({
        status: {
          success: false,
          message: "ユーザ認証に失敗しました",
          errors
        }
      });
    }
  });
};

export const verifyToken = (req, res, next) => {
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
      const { token } = req.body;

      if (token === undefined || token === null || token === "") throw "token is empty";

      const decoded = yield verifyPromise(token);

      if (decoded.enabled === false) throw "user is disabled";

      let user = yield User.findById(decoded._id);

      if (user === null) throw "user is empty";

      const tenant = yield Tenant.findOne(user.tenant_id);

      const _tenant = { ...tenant.toObject()}
      _tenant.trash_icon_visibility = yield checkFilePermission(_tenant.trash_dir_id, decoded._id, constants.PERMISSION_VIEW_LIST);  //ごみ箱アイコンの表示権限有無

      user = { ...user.toObject(), tenant: _tenant, iat: decoded.iat };
      delete user.password;

      res.json({
        status: { status: "success" },
        body: { user }
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "token is empty":
        errors.token = "ログイントークンが空のためトークン認証に失敗しました";
        break;
      case "user is disabled":
        errors.token = "指定されたユーザは現在無効状態のためトークン認証に失敗しました";
        break;
      case "user is empty":
        errors.token = "指定されたユーザ存在しないためトークン認証に失敗しました";
        break;
      default:
        if (e.name === "JsonWebTokenError") {
          errors.token = "ログイントークンが不正のためトークン認証に失敗しました";
        } else {
          errors.unknown = commons.errorParser(e);
        }
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "トークン認証に失敗しました",
          errors
        }
      });
    }
  });
};

