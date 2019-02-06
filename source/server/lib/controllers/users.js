import util from "util";
import mongoose from "mongoose";
import co from "co";
import crypto from "crypto";
import User from "../models/User";
import Tenant from "../models/Tenant";
import Group from "../models/Group";
import AuthorityMenu from "../models/AuthorityMenu";
import RoleMenu from "../models/RoleMenu";
import { concat,first } from "lodash";
import logger from "../logger";
import * as constants from "../configs/constants";

const { ObjectId } = mongoose.Types;

export const index = (req, res, next) => {
  co(function* () {
    try {
      const { q } = req.query;
      const { tenant_id } = res.user;

      if (tenant_id === undefined ||
          tenant_id === null ||
          tenant_id === "") throw "tenant_id is empty";

      const tenant = yield Tenant.findById(tenant_id);
      if (tenant === null) throw "tenant is empty";

      let conditions;

      if (q) {
        conditions = {
          $and: [
            { tenant_id: mongoose.Types.ObjectId(tenant_id) }
          ],
          $or: [
            { name: new RegExp(q, "i") },
            { account_name: new RegExp(q, "i") },
          ]
        };
      }
      else {
        conditions = {
          tenant_id: mongoose.Types.ObjectId(tenant_id)
        };
      }

      const users = yield User.aggregate([
        { $match: conditions },
        { $lookup:
          { from: "groups", localField: "groups", foreignField: "_id", as: "groups" }
        }
      ]);

      res.json({
        status: { success: true },
        body: users
      });

    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "tenant_id is empty":
        errors.tenant_id = e;
        break;
      case "tenant is empty":
        errors.tenant = e;
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const view = (req, res, next) => {
  co(function* () {
    try {
      const { user_id } = req.params;
      if (user_id === undefined ||
          user_id === null ||
          user_id === "") throw "user_id is empty";

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";
      const user = yield User.findById(user_id);
      if (user === null) throw "user is empty";

      const tenant = yield Tenant.findById(user.tenant_id);

      const group_ids = user.groups.map( group => mongoose.Types.ObjectId(group) );
      const groups = yield Group.find({ _id: group_ids });

      const { role_menus } = yield AuthorityMenu.findOne({users:user});

      res.json({
        status: { success: true },
        body: {
          ...user.toObject(),
          tenant: tenant.toObject(),
          role_id: role_menus,
          groups
        }
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためユーザの取得に失敗しました";
        break;
      case "user_id is empty":
        errors.user_id = "指定されたユーザが存在しないためユーザの取得に失敗しました";
        break;
      case "user is empty":
        errors.user = e;
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, message: "ユーザの取得に失敗しました", errors }
      });
    }
  });
};

export const add = (req, res, next) => {
  co(function*() {
    try {
      const user = new User(req.body.user);
      const { tenant_id } = res.user;
      const { role_id } = req.body.user;

      if (tenant_id === undefined ||
        tenant_id === null ||
        tenant_id === "") throw "tenant_id is empty";

      user.tenant_id = tenant_id;

      if (user.account_name === undefined
          || user.account_name === null
          || user.account_name === "") throw "account_name is empty";

      if (user.account_name.length >= constants.MAX_STRING_LENGTH) {
        throw "account_name is too long";
      }

      if (user.name === undefined
          || user.name === null
          || user.name === "") throw "name is empty";

      if (user.name.length >= constants.MAX_STRING_LENGTH) {
        throw "name is too long";
      }

      if (user.email === undefined
          || user.email === null
          || user.email === "") throw "email is empty";

      if (user.email.length >= constants.MAX_EMAIL_LENGTH) {
        throw "email is too long";
      }

      if (user.password === undefined
          || user.password === null
          || user.password === "") throw "password is empty";

      if (role_id === undefined
          || role_id === null
          || role_id === "") throw "role_id is empty";

      let _user = yield User.findOne({ account_name: user.account_name });
      if (_user !== null) throw "account_name is duplicate";

      _user = yield User.findOne({ email: user.email });
      if (_user !== null) throw "email is duplicate";

      const hash = crypto.createHash("sha512").update(user.password).digest("hex");
      user.password = hash;

      const authority_menus = new AuthorityMenu;
      authority_menus.role_menus = ObjectId(role_id);
      authority_menus.users = user;
      authority_menus.groups = null;

      const {createdUser,createdAuthorityMenu} = yield { createdUser:user.save(), createdAuthorityMenu:authority_menus.save() };

      res.json({
        status: { success: true },
        body: createdUser
      });
    }
    catch (err) {
      let errors = {};

      switch (err) {
      case "name is empty":
        errors.name = "表示名が空のためユーザの作成に失敗しました";
        break;
      case "name is too long":
        errors.name = `表示名が制限文字数(${constants.MAX_STRING_LENGTH})を超過したためユーザの作成に失敗しました`;
        break;
      case "account_name is empty":
        errors.account_name = "アカウント名が空のためユーザの作成に失敗しました";
        break;
      case "account_name is too long":
        errors.account_name = `アカウント名が制限文字数(${constants.MAX_STRING_LENGTH})を超過したためユーザの作成に失敗しました`;
        break;
      case "account_name is duplicate":
        errors.account_name = "既に同アカウント名のユーザが存在するためユーザの作成に失敗しました";
        break;
      case "email is empty":
        errors.email = "メールアドレスが空のためユーザの作成に失敗しました";
        break;
      case "email is too long":
        errors.email = `メールアドレスが制限文字数(${constants.MAX_EMAIL_LENGTH})を超過したためユーザの作成に失敗しました`;
        break;
      case "email is duplicate":
        errors.email = "メールアドレスが重複しているためユーザの作成に失敗しました";
        break;
      case "password is empty":
        errors.password = "パスワードが空のためユーザの作成に失敗しました";
        break;
      case "role_id is empty":
        errors.role_id = "ユーザ種類が空です";
        break;
      default:
        errors = err;
        break;
      }

      res.status(400).json({
        status: { success: false, message: "ユーザの作成に失敗しました",errors }
      });
    }
  });
};

export const updatePassword = (req, res, next) => {
  co(function* () {
    try {
      const { user_id } = req.params;
      const { current_password, new_password } = req.body;

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";
      if (current_password === null ||
          current_password === ""   ||
          current_password === undefined) throw "current password is empty";

      if (new_password === null ||
          new_password === ""   ||
          new_password === undefined) throw "new password is empty";

      const user = yield User.findById(user_id);
      if (user === null || user === undefined) throw "user not found";

      const current_hash = crypto.createHash("sha512").update(current_password).digest("hex");

      if (current_hash !== user.password) throw "password is not match";

      const new_hash = crypto.createHash("sha512").update(new_password).digest("hex");
      user.password = new_hash;

      const changedUser = yield user.save();

      res.json({
        status: { success: true },
        body: changedUser
      });

    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のため変更に失敗しました";
        break;
      case "current password is empty":
        errors.current_password = "現在のパスワードが空のため変更に失敗しました";
        break;
      case "new password is empty":
        errors.new_password = "新しいパスワードが空のため変更に失敗しました";
        break;
      case "password is not match":
        errors.current_password = "変更前のパスワードが一致しないため変更に失敗しました";
        break;
      case "user not found":
        errors.user = "指定されたユーザが存在しないため変更に失敗しました";
        break;
      default:
        errors.unknown = "変更に失敗しました";
        break;
      }

      res.status(400).json({
        status: { success: false, message: "パスワードの変更に失敗しました", errors }
      });

    }
  });
};

export const updatePasswordForce = (req, res, next) => {
  co(function* () {
    try {
      const { user_id } = req.params;
      const { password } = req.body;

      if (user_id === undefined ||
          user_id === null ||
          user_id === "") throw "user_id is empty";

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";
      if (password === undefined ||
          password === null ||
          password === "") throw "password is empty";

      const user = yield User.findById(user_id);

      if (user === null) throw "user is empty";

      const sha = crypto.createHash("sha512");
      sha.update(password);
      const hash = sha.digest("hex");

      user.password = hash;
      const changedUser = yield user.save();

      res.json({
        status: { success: true },
        body: changedUser
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "user_id is invalid":
      case "user_id is empty":
      case "user is empty":
        errors.user_id = "ユーザIDが不正のためパスワードの変更に失敗しました";
        break;
      case "password is empty":
        errors.password = "パスワードが空のため変更に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, message: "パスワードの変更に失敗しました", errors }
      });
    }
  });
};

export const toggleEnabled = (req, res, next) => {
  co(function* () {
    try {
      const { user_id } = req.params;
      if (user_id === undefined ||
          user_id === null ||
          user_id === "") throw "user_id is empty";

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";

      const user = yield User.findById(user_id);
      if (user === null) throw "user is empty";

      user.enabled = !user.enabled;
      const changedUser = yield user.save();

      res.json({
        status: { success: true },
        body: changedUser
      });
    }
    catch (e) {
      let errors = {};
      switch (e) {
      case "user_id is empty":
        errors.user_id = e;
        break;
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためユーザの有効化/無効化に失敗しました";
        break;
      case "user is empty":
        errors.user = "指定されたユーザは存在しません";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false, message: "ユーザの有効化/無効化に失敗しました", errors }
      });
    }
  });
};

export const updateName = (req, res, next) => {
  co(function* () {
    try {
      const user_id = req.params.user_id;
      const name = req.body.name;

      if (name === null ||
          name === undefined ||
          name === "") throw "name is empty";

      if (name.length >= constants.MAX_STRING_LENGTH) throw "name is too long";

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";
      const user = yield User.findById(user_id);
      if (user === null) throw "user not found";

      user.name = name;
      const changedUser = yield user.save();

      res.json({
        status: { success: true },
        body: changedUser
      });

    }
    catch (err) {
      let errors = {};

      switch (err) {
      case "name is empty":
        errors.name = "表示名が空のため変更に失敗しました";
        break;
      case "name is too long":
        errors.name = `表示名が規定文字数(${constants.MAX_STRING_LENGTH})を超過したため変更に失敗しました`;
        break;
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のため表示名の変更に失敗しました";
        break;
      case "user not found":
        errors.user = "指定されたユーザが見つからないため変更に失敗しました";
        break;
      default:
        errors = err;
        break;
      }

      res.status(400).json({
        status: { success: false, message: "ユーザの表示名の変更に失敗しました", errors }
      });
    }
  });
};

export const updateEmail = (req, res, next) => {
  co(function* () {
    try {
      const { user_id } = req.params;
      const { email } = req.body;

      if (user_id === "" ||
          user_id === undefined ||
          user_id === null) throw "user_id is empty";

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";

      if (email === ""
          || email === null
          || email === undefined) throw "email is empty";

      if (email.length >= constants.MAX_EMAIL_LENGTH) {
        throw "email is too long";
      }

      const user = yield User.findById(user_id);
      if (user === null) throw "user is empty";

      user.email = email;
      const changedUser = yield user.save();

      res.json({
        status: { success: true },
        body: changedUser
      });
    }
    catch (e) {
      let errors = {};
      switch (e) {
      case "user_id is empty":
        errors.user_id = e;
        break;
      case "email is too long":
        errors.email = `メールアドレスが規定文字数(${constants.MAX_EMAIL_LENGTH})を超過したためメールアドレスの変更に失敗しました`;
        break;
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためメールアドレスの変更に失敗しました";
        break;
      case "email is empty":
        errors.email = "指定されたメールアドレスが空のためメールアドレスの変更に失敗しました";
        break;
      case "user is empty":
        errors.user = "指定されたユーザが存在しないため変更に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "メールアドレスの変更に失敗しました",
          errors
        }
      });
    }
  });
};

export const addUserToGroup = (req, res, next) => {
  co(function* () {
    try {
      const user_id = req.params.user_id;
      const group_id = req.body.group_id;

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";

      if (group_id === undefined || group_id === null || group_id === "") {
        throw "group_id is empty";
      }

      if (! mongoose.Types.ObjectId.isValid(group_id)) throw "group_id is invalid";

      const [ user, group ] = yield [
        User.findById(user_id),
        Group.findById(group_id)
      ];

      if (user === null) throw `存在しないユーザです user_id: ${user_id}`;
      if (group === null) throw `存在しないグループです group_id: ${group_id}`;

      if (user.groups.filter( id => id.toString() === group_id ).length > 0) throw "group_id is already exists";

      user.groups = [ ...user.groups, group._id ];

      const changedUser = yield user.save();

      res.json({
        status: { success: true },
        body: changedUser
      });
    }
    catch (err) {
      let errors = {};

      switch(err) {
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためグループの追加に失敗しました";
        break;
      case "group_id is empty":
        errors.group_id = "グループIDが空のためグループの追加に失敗しました";
        break;
      case "group_id is invalid":
        errors.group_id = "グループIDが不正のためグループの追加に失敗しました";
        break;
      case "group_id is already exists":
        errors.group_id = "指定されたユーザは既に指定したグループに所属しているためグループの追加に失敗しました";
        break;
      default:
        errors.unknown = err;
        break;
      }
      res.status(400).json({
        status: { success: false, message: "グループの追加に失敗しました", errors }
      });
    }
  });
};

export const removeUserOfGroup = (req, res, next) => {
  co(function* () {
    try {
      const { user_id, group_id } = req.params;

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";
      if (! mongoose.Types.ObjectId.isValid(group_id)) throw "group_id is invalid";

      const [ user, group ] = yield [
        User.findById(user_id),
        Group.findById(group_id)
      ];

      if (user === null) throw "user is empty";
      if (group === null) throw "group is empty";

      const filtered = user.groups.filter( _group => _group.toString() !== group._id.toString() );

      if (user.groups.length === filtered.length) throw "group_id is not found";

      user.groups = filtered;

      const changedUser = yield user.save();
      res.json({
        status: { success: true },
        body: changedUser
      });
    }
    catch (e) {
      let errors = {};

      switch(e) {
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためグループのメンバ削除に失敗しました";
        break;
      case "group_id is invalid":
        errors.group_id = "グループIDが不正のためグループのメンバ削除に失敗しました";
        break;
      case "group_id is not found":
        errors.group_id = "指定されたグループにユーザが所属していないためグループのメンバ削除に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      res.status(400).json({
        status: {
          success: false,
          message: "グループのメンバ削除に失敗しました",
          errors
        }
      });
    }
  });
};

export const updateAccountName = (req, res, next) => {
  co(function* () {
    try {
      const user_id = req.params.user_id;
      const account_name = req.body.account_name;

      if (account_name === null ||
          account_name === undefined ||
          account_name === "") throw "account_name is empty";

      if (account_name.length >= constants.MAX_STRING_LENGTH) throw "account_name is too long";

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";

      const user = yield User.findById(user_id);
      if ( user === null) throw "user not found";

      user.account_name = account_name;
      const changedUser = yield user.save();

      res.json({
        status: { success: true },
        body: changedUser
      });

    }
    catch (err) {
      let errors = {};

      switch (err) {
      case "account_name is empty":
        errors.account_name = "アカウント名が空のためログイン名の変更に失敗しました";
        break;
      case "account_name is too long":
        errors.account_name = `アカウント名が規定文字数(${constants.MAX_STRING_LENGTH})を超過したためログイン名の変更に失敗しました`;
        break;
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためログイン名の変更に失敗しました";
        break;
      case "user not found":
        errors.user = "指定されたユーザが見つからないため変更に失敗しました";
        break;
      default:
        errors = err;
        break;
      }

      res.status(400).json({
        status: { success: false, message: "ログイン名の変更に失敗しました", errors }
      });
    }
  });
};

export const getWithGroups = (req, res, next) => {
  co(function* (){
    try {
      const { tenant_id } = res.user;

      if (tenant_id === undefined ||
        tenant_id === null ||
        tenant_id === "") throw "tenant_id is empty";

      const tenant = yield Tenant.findById(tenant_id);
      if (tenant === null) throw "tenant is empty";

      const conditions = {
        tenant_id: mongoose.Types.ObjectId(tenant_id)
      };

      const users = yield User.aggregate([
        { $match: conditions },
        { $lookup:
          { from: "groups", localField: "groups", foreignField: "_id", as: "groups" }
        }
      ]);

      const groups = yield Group.aggregate([
        { $match: conditions },
      ]);

      const returnGroups = groups.map( group => {
        group.type = "group";
        return group;
      });

      const mergedUsers = concat(users, returnGroups);

      res.json({
        status: { success: true },
        body: mergedUsers
      });
    } catch (err) {
      let errors = {};

      switch (err) {
      default:
        errors = err;
        break;
      }

      res.status(400).json({
        status: { success: false, errors }
      });

    }
  });
};

export const updateRoleMenus = (req, res, next ) => {
  co(function* () {
    try {

      const user_id = req.params.user_id;
      const { role_menu_id } = req.body;

      if (! mongoose.Types.ObjectId.isValid(user_id)) throw "user_id is invalid";

      if (role_menu_id === undefined || role_menu_id === null || role_menu_id === "") {
        throw "role_menu_id is empty";
      }

      if (! mongoose.Types.ObjectId.isValid(role_menu_id)) throw "role_menu_id is invalid";

      const [ user ,role ] = yield [User.findById(user_id), RoleMenu.findById(role_menu_id) ];

      if (user === null) throw "user is empty";
      if (role === null) throw "role is empty";

      let authorityMenus = first( yield AuthorityMenu.find({users: ObjectId(user._id)}));
      if(authorityMenus === undefined ){
        authorityMenus = new AuthorityMenu();
        authorityMenus.users = user;
      }

      authorityMenus.role_menus = role;
      const savedAuthorityMenus = yield authorityMenus.save();

      res.json({
        status: { success: true },
        body: savedAuthorityMenus
      });

    } catch (err) {

      let errors = {};

      switch (err) {
      case "user_id is invalid":
        errors.user_id = "ユーザIDが不正のためメニュー権限の変更に失敗しました";
        break;
      case "user is empty":
        errors.user = "存在しないユーザです";
        break;
      case "role_menu_id is empty":
        errors.role_id = "メニュー権限IDが空のためメニュー権限の変更に失敗しました";
        break;
      case "role_menu_id is invalid":
        errors.role_id = "メニュー権限IDが不正のためメニュー権限の変更に失敗しました";
        break;
      case "role is empty":
        errors.role = "存在しないユーザタイプです";
        break;
      default:
        errors = err;
        break;
      }
      logger.error(errors);
      res.status(400).json({
        status: { success: false, message: "メニュー権限の変更に失敗しました", errors }
      });

    }
  });
};
