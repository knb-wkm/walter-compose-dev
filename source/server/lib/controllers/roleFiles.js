import mongoose from "mongoose";
import co from "co";
import RoleFile from "../models/RoleFile";
import Action from "../models/Action";
import logger from "../logger";
import * as commons from "./commons";
import { findIndex } from "lodash";
import { ValidationError, RecordNotFoundException } from "../errors/AppError";

// constants
import * as constants from "../configs/constants";

const { ObjectId } = mongoose.Types;

export const index = (req, res, next) => {
  co(function* () {
    try {
      const { tenant_id } = res.user;
      const roles = yield RoleFile.aggregate([
        {
          $match: {
            tenant_id: ObjectId(tenant_id)
          }
        },
        {
          $lookup: {
            from: "actions",
            localField: "actions",
            foreignField: "_id",
            as: "actions"
          }
        }
      ]);

      res.json({
        status: { success: true },
        body: roles
      });
    }
    catch (e) {
      let errors = {};

      errors = e;
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const create = (req, res, next) => {
  co(function* () {
    try {
      const { role } = req.body;

      if (role === undefined) throw new ValidationError( "role is empty" );

      if (role.name === undefined ||
          role.name === null ||
          role.name === "") throw new ValidationError( "name is empty" );

      if ( role.name.length > constants.MAX_STRING_LENGTH) throw new ValidationError( "name is too long" );

      if (role.description !== undefined &&  typeof role.description === "string" && role.description.length > constants.MAX_STRING_LENGTH) throw new ValidationError( "description is too long" );

      const _role = yield RoleFile.findOne({
        name: role.name,
        tenant_id: res.user.tenant_id
      });

      if ( _role !== null ) throw new ValidationError( "name is duplicate" );

      const newRoleFile = new RoleFile();
      newRoleFile.name = role.name;
      newRoleFile.description = role.description;
      newRoleFile.tenant_id = res.user.tenant_id;

      const createdRoleFile = yield newRoleFile.save();

      res.json({
        status: { success: true },
        body: createdRoleFile
      });
    }
    catch (e) {
      let errors = {};

      switch (e.message) {
      case "role is empty":
        errors.role = "ロールが空のため作成に失敗しました";
        break;
      case "name is empty":
        errors.name = "ロール名が空です";
        break;
      case "name is duplicate":
        errors.name = "そのロール名は既に使用されています";
        break;
      case "name is too long":
        errors.name = "ロール名が長すぎます";
        break;
      case "description is too long":
        errors.description = "備考が長すぎます";
      default:
        errors.unknown = commons.errorParser(e);
        break;
      }
      logger.error(e);
      res.status(400).json({
        status: { success: false,message:"ロールの作成に失敗しました", errors }
      });
    }
  });
};

export const view = (req, res, next) => {
  co(function* () {
    try {
      const { role_id } = req.params;
      if( !ObjectId.isValid(role_id) ) throw new ValidationError( "role_id is not valid" );
      const role = yield RoleFile.findById(role_id);
      if (role === null || role === undefined) throw new ValidationError( "role is not found" );

      const actions = yield Action.find({ _id: { $in: role.actions } });

      res.json({
        status: { success: true },
        body: { ...role.toObject(), actions }
      });
    }
    catch (e) {
      let errors = {};
      switch (e.message){
        case "role is not found":
          errors.role = "指定されたロールが存在しないためロールの取得に失敗しました";
          break;
        case "role_id is not valid":
          errors.role = "ロールIDが不正なためロールの取得に失敗しました";
          break;
        default:
          errors = e;
      }

      res.status(400).json({
        status: { success: false, message:"ロールの取得に失敗しました", errors }
      });
    }

  });
};

export const updateName = (req, res, next) => {
  co(function* () {
    try {
      const { role_id } = req.params;
      const { name } = req.body;
      const { tenant_id } = res.user;
      if (!ObjectId.isValid(role_id)) throw new ValidationError( "role_id is not valid" );

      if (name === undefined || name === null || name === "") throw new ValidationError( "name is empty" );
      if (name.length > constants.MAX_STRING_LENGTH) throw new ValidationError( "name is too long" );

      const _role = yield RoleFile.find({name: name, tenant_id: tenant_id});
      if(_role.length > 0) throw new ValidationError ( "name is duplicate" );

      const role = yield RoleFile.findById(role_id);
      if (role === undefined || role === null) throw new RecordNotFoundException( "role is not found" );

      role.name = name;
      const changedRoleFile = yield role.save();

      res.json({
        status: { success: true },
        body: changedRoleFile
      });
    }
    catch (e) {
      let errors = {};

      switch (e.message) {
      case "name is empty":
        errors.name = "ロール名が空です";
        break;
      case "name is duplicate":
        errors.name = "そのロール名は既に使用されています";
        break;
      case "name is too long":
        errors.name = "ロール名が長すぎます";
        break;
      case "role_id is not valid":
        errors.role_id = "ロールIDが不正なためロール名の変更に失敗しました";
        break;
      case "role is not found":
        errors.role = "指定されたロールが見つからないため変更に失敗しました";
        break;
      default:
        errors.unknown = commons.errorParser(e);
        break;
      }

      res.status(400).json({
        status: { success: false, message:"ロール名の変更に失敗しました", errors }
      });
    }
  });
};

export const updateDescription = (req, res, next) => {
  co(function* () {
    try {
      const { role_id } = req.params;
      const { description } = req.body;

      if( !ObjectId.isValid(role_id) ) throw new ValidationError( "role_id is not valid" );

      const role = yield RoleFile.findById(role_id);
      if (role === undefined || role === null) throw new ValidationError( "role is not found" );

      role.description = description;
      const changedRoleFile = yield role.save();

      res.json({
        status: { success: true },
        body: changedRoleFile
      });
    }
    catch (e) {
      let errors = {};

      switch (e.message) {
        case "role is not found":
          errors.role = "指定されたロールが見つからないため備考の変更に失敗しました";
          break;
        case "role_id is not valid":
          errors.role_id = "ロールIDが不正なため備考の変更に失敗しました";
          break;
      default:
        errors.unknown = commons.errorParser(e);
        break;
      }

      res.status(400).json({
        status: { success: false, message:"備考の変更に失敗しました", errors }
      });
    }
  });
};

export const remove = (req, res, next) => {
  co(function* () {
    try {
      const { role_id } = req.params;
      if( !ObjectId.isValid(role_id) ) throw new ValidationError( "role is not valid" );
      const role = yield RoleFile.findById(role_id);

      if (role === null) throw new ValidationError( "role is empty" );

      const deletedRoleFile = role.remove();

      res.json({
        status: { success: true },
        body: deletedRoleFile
      });

    }
    catch (e) {
      let errors = {};

      switch (e.message) {
      case "role is empty":
        errors.role = "指定されたロールが見つからないため削除に失敗しました";
        break;
      case "role is not valid":
        errors.role = "ロールIDが不正なため削除に失敗しました";
        break;
      default:
        errors.unknown = commons.errorParser(e);
        break;
      }

      res.status(400).json({
        status: { success: false, message:"ロールの削除に失敗しました" ,errors }
      });
    }
  });
};

export const removeActionOfRoleFile = (req, res, next) => {
  co(function* () {
    try {
      const { role_id, action_id } = req.params;
      if ( !ObjectId.isValid(role_id) ) throw new ValidationError( "role_id is not Valid" );
      if ( !ObjectId.isValid(action_id) ) throw new ValidationError( "action_id is not Valid" );

      const [ role, action ] = yield [
        RoleFile.findById(role_id),
        Action.findById(action_id)
      ];

      if (role === null) throw new RecordNotFoundException( "role is empty" );
      if (action === null) throw new RecordNotFoundException( "action is empty" );
      if (findIndex(role.actions, action._id) === -1) throw new ValidationError( "action is not found" );

      role.actions = role.actions.filter( _action => {
        return _action.toString() !== action._id.toString();
      });

      const changedRoleFile = yield role.save();

      res.json({
        status: { success: true },
        body: changedRoleFile
      });

    }
    catch (e) {
      let errors = {};

      switch (e.message) {
        case "role_id is not Valid":
          errors.role_id = "ロールIDが不正なためアクションの削除に失敗しました";
          break;
        case "action_id is not Valid":
          errors.action_id = "アクションIDが不正なためアクションの削除に失敗しました";
          break;
        case "role is empty":
          errors.role = "指定されたロールが存在しないため削除に失敗しました";
          break;
        case "action is empty":
          errors.action = "指定されたアクションが存在しないため削除に失敗しました";
          break;
        case "action is not found":
          errors.action = "指定されたアクションは登録されていないため削除に失敗しました";
          break;
      default:
        errors.unknown = commons.errorParser(e);
      }
      logger.error(e);
      res.status(400).json({
        status: { success: false, message:"アクションの削除に失敗しました", errors }
      });
    }
  });
};

export const addActionToRoleFile = (req, res, next) => {
  co(function* () {
    try {
      const { role_id, action_id } = req.params;
      if ( !ObjectId.isValid(role_id) ) throw new ValidationError( "role_id is not Valid" );
      if ( !ObjectId.isValid(action_id) ) throw new ValidationError( "action_id is not Valid" );

      const [ role, action ] = yield [
        RoleFile.findById(role_id),
        Action.findById(action_id)
      ];

      if (role === null) throw new RecordNotFoundException( "role is empty" );
      if (action === null) throw new RecordNotFoundException( "action is empty" );
      if (role.actions.indexOf(action._id) >= 0 ) throw new ValidationError( "action is duplicate" );

      role.actions = [ ...role.actions, action._id ];
      const changedRoleFile = yield role.save();

      res.json({
        status: { success: true },
        body: changedRoleFile
      });

    }
    catch (e) {
      let errors = {};
      switch (e.message) {
        case "role_id is not Valid":
          errors.role_id = "ロールIDが不正なためアクションの追加に失敗しました";
          break;
        case "action_id is not Valid":
          errors.action_id = "アクションIDが不正なためアクションの追加に失敗しました";
          break;
        case "role is empty":
          errors.role = "指定されたロールが見つからないためアクションの追加に失敗しました";
          break;
        case "action is empty":
          errors.action = "指定されたアクションが見つからないため追加に失敗しました";
          break;
        case "action is duplicate":
          errors.action = "指定されたアクションが既に登録されているため追加に失敗しました";
          break;
        default:
          errors.unknown = commons.errorParser(e);
          break;
      }

      logger.error(e);
      res.status(400).json({
        status: { success: false, message:"アクションの追加に失敗しました", errors }
      });
    }
  });
};
