import mongoose from "mongoose";
import co from "co";
import RoleMenu from "../models/RoleMenu";
import Menu from "../models/Menu";
import logger from "../logger";
import * as commons from "./commons";
import { ValidationError, RecordNotFoundException } from "../errors/AppError";

// constants
import * as constants from "../configs/constants";

const { ObjectId } = mongoose.Types;

export const index = (req, res, next) => {
  co(function* () {
    try {
      const { tenant_id } = res.user;

      const roles = yield RoleMenu.aggregate([
        { $match:{ tenant_id: ObjectId(tenant_id)}},
        { $lookup:{
            from: "menus",
            localField: "menus",
            foreignField: "_id",
            as: "menus"
        }}
      ]);

      res.json({
        status: { success: true },
        body: roles
      });
    } catch (e) {
      let errors = {};

      switch (e) {
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

export const create = (req, res, next) => {
  co(function* () {
    try {
      const { roleMenu } = req.body;
      if (roleMenu.name === undefined ||
          roleMenu.name === null ||
          roleMenu.name === "") throw new ValidationError( "name is empty" );

      if (roleMenu.name.length > constants.MAX_STRING_LENGTH) throw new ValidationError( "name is too long" );
      if ((roleMenu.description !== undefined && roleMenu.description !== null)
        && roleMenu.description.length > constants.MAX_STRING_LENGTH) throw new ValidationError( "description is too long" );

      const _role = yield RoleMenu.findOne({
        name: roleMenu.name,
        tenant_id: res.user.tenant_id
      });

      if( _role !== null ) throw new ValidationError( "name is duplicate" );

      const newRoleMenu = new RoleMenu();
      newRoleMenu.name = roleMenu.name;
      newRoleMenu.description = roleMenu.description;
      newRoleMenu.tenant_id = res.user.tenant_id;

      const createRoleMenu = yield newRoleMenu.save();

      res.json({
        status: { success: true },
        body: createRoleMenu
      });

    }catch(e){
      let errors = {};

      switch(e.message){
        case "name is empty":
          errors.name = "ユーザタイプ名が空です";
          break;
        case "name is duplicate":
          errors.name = "そのユーザタイプ名は既に使用されています";
          break;
        case "name is too long":
          errors.name = "ユーザタイプ名が長すぎます";
          break;
        case "description is too long":
          errors.description = "備考が長すぎます";
          break;
        default:
          errors.unknown = commons.errorParser(e);
      }
      logger.error(e);

      res.status(400).json({
        status: {
          success: false,
          message: 'ユーザタイプの作成に失敗しました',
          errors
        }
      });
    }
  });
};

export const view = (req, res, next) => {
  co(function*() {
    try {

      const { role_id } = req.params;

      if ( !mongoose.Types.ObjectId.isValid(role_id) ) throw new ValidationError("role_id is not valid");

      const role = yield RoleMenu.findById(role_id);
      if(role === null || role === undefined) throw new ValidationError("role is not found");

      const menus = yield Menu.find({ _id: { $in: role.menus }});

      res.json({
        status: { success: true },
        body: { ...role.toObject(), menus }
      });

    } catch (e) {
      let errors = {};

      switch (e.message) {
        case "role_id is not valid":
          errors.role_id = "ロールIDが不正なためユーザタイプを取得に失敗しました";
          break;
        case "role is not found":
          errors.role = "ユーザタイプが存在しません";
          break;
        default:
          errors.unknown = commons.errorParser(e);
          break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "ユーザタイプの取得に失敗しました",
          errors }
      });

    }
  });
};

export const remove = (req, res, next) => {
  co(function* (){
    try {
      const { role_id } = req.params;
      if ( !mongoose.Types.ObjectId.isValid(role_id) ) throw new ValidationError("role_id is not valid");
      const role = yield RoleMenu.findById(role_id);

      if (role === null) throw new RecordNotFoundException("role is empty");

      const deletedRoleMenu = role.remove();

      res.json({
        status: { success: true },
        body: deletedRoleMenu
      });


    } catch (e) {
      let errors = {};

      switch (e.message) {
        case "role_id is not valid":
          errors.role_id = "ロールIDが不正なためユーザタイプを削除に失敗しました";
          break;
        case "role is empty":
          errors.role = "指定されたユーザタイプが見つからないため削除に失敗しました";
          break;
        default:
          errors.unknown = commons.errorParser(e);
          break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "ユーザタイプの削除に失敗しました",
          errors }
      });
    }
  });
};

export const updateName = (req, res, next) => {
  co(function* (){
    try {

      const { role_id } = req.params;
      const { name } = req.body;
      if ( !mongoose.Types.ObjectId.isValid(role_id) ) throw new ValidationError("role_id is not valid");
      if (name === undefined || name === null || name === "") throw new ValidationError("name is empty");
      if (name.length > constants.MAX_STRING_LENGTH ) throw new ValidationError( "name is too long" );
      const _roleCount = yield RoleMenu.find({name:name}).count();
      if( _roleCount > 0 ) throw new ValidationError("name is duplicate");

      const role = yield RoleMenu.findById(role_id);
      if (role === undefined || role === null) throw new RecordNotFoundException("role is not found");

      role.name = name;
      const changedRoleMenu = yield role.save();

      res.json({
        status: { success: true },
        body: changedRoleMenu
      });

    } catch (e) {
      let errors = {};

      switch (e.message) {
        case "role_id is not valid":
          errors.role_id = "ロールIDが不正なためユーザタイプ名の変更に失敗しました";
          break;
        case "name is empty":
          errors.name = "ユーザタイプ名が空です";
          break;
        case "name is duplicate":
          errors.name = "そのユーザタイプ名は既に使用されています";
          break;
        case "name is too long":
          errors.name = "ユーザタイプ名が長すぎます";
          break;
        case "role is not found":
          errors.role = "指定されたユーザタイプが見つからないため変更に失敗しました";
          break;
        default:
          errors.unknown = e;
          break;
      }
      logger.error(e);
      res.status(400).json({
        status: {
          success: false,
          message: "ユーザタイプ名の変更に失敗しました",
          errors
          }
      });
    }
  });
};


export const updateDescription = (req, res, next) => {
  co(function* () {
    try {
      const { role_id } = req.params;
      const { description } = req.body;

      if ( !mongoose.Types.ObjectId.isValid(role_id) ) throw new ValidationError("role_id is not valid");
      const role = yield RoleMenu.findById(role_id);
      if (role === undefined || role === null) throw new ValidationError("role is not found");

      role.description = description;
      const changedRoleMenu = yield role.save();

      res.json({
        status: { success: true },
        body: changedRoleMenu
      });
    }
    catch (e) {
      let errors = {};

      switch (e.message) {
        case "role_id is not valid":
          errors.role_id = "ロールIDが不正なため備考の変更に失敗しました";
          break;
      case "role is not found":
        errors.role = "指定されたユーザタイプが見つからないため変更に失敗しました";
        break;
      default:
        errors.unknown = commons.errorParser(e);
        break;
      }
      logger.error(e);
      res.status(400).json({
        status: { success: false, message:"備考の変更に失敗しました", errors }
      });
    }
  });
};

export const addMenuToRoleMenu = (req, res, next) => {
  co(function* (){
    try {
      const { role_id, menu_id } = req.params;
      if ( !mongoose.Types.ObjectId.isValid(role_id) ) throw new ValidationError("role_id is not valid");
      const [ role, menu ] = yield [
        RoleMenu.findById(role_id),
        Menu.findById(menu_id)
      ];

      if( role === null ) throw new ValidationError( "role is empty" );
      if( menu === null ) throw new ValidationError( "menu is empty" );
      if( role.menus.indexOf(menu._id) >= 0 ) throw new ValidationError( "menu is duplicate" );

      role.menus = [ ...role.menus, menu._id ];

      const changedRoleMenu = yield role.save();
      res.json({
        status: { success: true },
        body: changedRoleMenu
      });

    } catch (e) {
      let errors = {};
      switch (e.message) {
        case "role_id is not valid":
          errors.role_id = "ロールIDが不正なためメニューの追加に失敗しました";
          break;
        case "role is empty":
          errors.role = "指定されたユーザタイプが見つからないためメニューの追加に失敗しました";
          break;
        case "menu is empty":
          errors.menu = "指定されたメニューが見つからないため追加に失敗しました";
          break;
        case "menu is duplicate":
          errors.menu = "指定されたメニューが既に登録されているため追加に失敗しました";
          break;
        default:
          errors.unknown = commons.errorParser(e);
          break;
      }
      logger.error(e);
      res.status(400).json({
        status: { success: false, message:"メニューの追加に失敗しました" ,errors }
      });
    }
  });
};

export const removeMenuOfRoleMenu = (req, res, next) => {
  co(function*(){
    try {
      const { role_id, menu_id } = req.params;
      if ( !mongoose.Types.ObjectId.isValid(role_id) ) throw new ValidationError("role_id is not valid");
      const [ role, menu ] = yield [
        RoleMenu.findById(role_id),
        Menu.findById(menu_id)
      ];

      if( role === null ) throw new ValidationError( "role is empty" );
      if( menu === null ) throw new ValidationError( "menu is empty" );
      if( role.menus.indexOf(menu_id) === -1 ) throw new ValidationError( "menu is not exist" );

      role.menus = role.menus.filter( _menus => (_menus.toString() !== menu._id.toString()));

      const changedRoleMenu = yield role.save();

      res.json({
        status: { success: true},
        body: changedRoleMenu
      });

    } catch (e) {
      let errors = {};

      switch (e.message) {
        case "role_id is not valid":
          errors.role_id = "ロールIDが不正です";
          break;
        case "role is empty":
          errors.role = "指定されたユーザタイプが見つからないためメニューの削除に失敗しました";
          break;
        case "menu is empty":
          errors.menu = "指定されたメニューが見つからないため削除に失敗しました";
          break;
        case "menu is not exist":
          errors.menu = "指定されたメニューは登録されていないため削除に失敗しました";
          break;
        default:
          errors.unknown = commons.errorParser(e);
          break;
      }
      logger.error(e);
      res.status(400).json({
        status: { success: false,message:"メニューの削除に失敗しました", errors }
      });
    }
  });
};
