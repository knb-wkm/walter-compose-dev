import mongoose from "mongoose";
import co from "co";
import Tag from "../models/Tag";

// constants
import * as constants from "../configs/constants";

// etc
import {
  ValidationError,
  RecordNotFoundException,
  PermisstionDeniedException
} from "../errors/AppError";
import logger from "../logger";


const ObjectId = mongoose.Types.ObjectId;

export const index = (req, res, next) => {
  co(function* () {
    try {

      const { q } = req.query;

      let conditions;
      if(q){
        conditions = {
          $and: [
            { label: new RegExp(q, "i") }
          ],
          $or: [
            { tenant_id: res.user.tenant_id },
            { user_id: res.user._id }
          ]
        };
      }else{
        conditions = {
          $or: [
            { tenant_id: res.user.tenant_id },
            { user_id: res.user._id },
          ]
        };
      }

      const tags = yield Tag.find(conditions);
      res.json({
        status: { success: true },
        body: tags
      });
    }
    catch (e) {

      let errors = {};
      errors.unknown = e;

      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const view = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      if (tag_id === undefined ||
          tag_id === null ||
          tag_id === "") throw new ValidationError("tag_id is empty");
      if( !mongoose.Types.ObjectId.isValid(tag_id) ) throw new ValidationError("tag_id is not valid");
      const tag = yield Tag.findById(req.params.tag_id);

      if (tag === null) throw new RecordNotFoundException("tag is empty");

      res.json({
        status: { success: true },
        body: tag
      });
    }
    catch (e) {
      let errors = {};
      switch (e.message) {
      case "tag_id is not valid":
        errors.tag_id = "タグIDが不正なためタグの取得に失敗しました";
        break;
      case "tag_id is empty":
        errors.tag_id = "タグIDが空のためタグの取得に失敗しました";
        break;
      case "tag is empty":
        errors.tag = "指定されたタグが存在しないためタグの取得に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      logger.error(errors);
      res.status(400).json({
        status: {
          success: false,
          message: "タグの取得に失敗しました",
          errors
         }
      });
    }
  });
};

export const create = (req, res, next) => {
  co(function* () {
    try {
      const { tag } = req.body;
      if (tag.label === undefined ||
          tag.label === null ||
          tag.label === "") throw new ValidationError("label is empty");

      if (tag.label.length > constants.MAX_STRING_LENGTH) throw new ValidationError("label is too long");

      if (tag.color === undefined || tag.color === null || tag.color === "") throw new ValidationError("color is empty");
      if( tag.color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/) === null ) throw new ValidationError("color is not valid");

      const _tag = yield Tag.find(
        { label: tag.label },
        { tenant_id: res.user.tenant_id }
      ).count();
      if (_tag > 0) throw new ValidationError("label is a duplicate");

      const newTag = new Tag();
      newTag.label = tag.label;
      newTag.color = tag.color;
      newTag.tenant_id = ObjectId(res.user.tenant_id);

      const createdTag = yield newTag.save();

      res.json({
        status: { success: true },
        body: createdTag
      });
    }
    catch (e) {
      let errors = {};

      switch (e.message) {
      case "label is empty":
        errors.label = "タグ名が空です";
        break;
      case "color is empty":
        errors.color = "色が空です";
        break;
      case "label is too long":
        errors.label = 'タグ名が長すぎます';
        break;
      case "label is a duplicate":
        errors.label = "そのタグ名は既に使用されています";
        break;
      case "color is not valid":
        errors.color = "色は16進数で指定してください";
        break;
      default:
        errors.unknown = e;
        break;
      }
      logger.error(e);
      res.status(400).json({
        status: {
          success: false,
          message: "タグの登録に失敗しました",
          errors
        }
      });
    }
  });
};

export const remove = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      if( !mongoose.Types.ObjectId.isValid(tag_id) ) throw new ValidationError("tag_id is not valid");
      const tag = yield Tag.findById(tag_id);
      if (tag === null) throw new RecordNotFoundException("tag is empty");

      const deletedTag = yield tag.remove();
      res.json({
        status: { success: true },
        body: deletedTag
      });
    }
    catch (e) {
      let errors = {};
      switch (e.message) {
      case "tag_id is not valid":
      errors.tag_id = "タグIDが不正なためタグの取得に失敗しました";
      break;
      case "tag is empty":
        errors.tag = "指定されたタグが存在しないためタグの取得に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: { success: false,
          message: "タグの削除に失敗しました",
          errors }
      });
    }
  });
};

export const changeLabel = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      const { label } = req.body;

      if( !mongoose.Types.ObjectId.isValid(tag_id) ) throw new ValidationError("tag_id is not valid");

      if (label === undefined ||
          label === null ||
          label === "") throw new ValidationError("label is empty");
      if (label.length > constants.MAX_STRING_LENGTH ) throw new ValidationError("lable is too long");

      const _tag = yield Tag.find(
        { label: label },
        { tenant_id: res.user.tenant_id }
      ).count();

      if(_tag > 0) throw new ValidationError("label is a duplicate");

      const tag = yield Tag.findById(tag_id);

      if (tag === null) throw new RecordNotFoundException("tag is empty");

      tag.label = label;
      const changedTag = yield tag.save();

      res.json({
        status: { success: true },
        body: changedTag
      });
    }
    catch (e) {
      let errors = {};

      switch (e.message) {
      case "tag_id is not valid":
        errors.tag_id = "タグIDが不正なためタグ名の変更に失敗しました";
        break;
      case "label is empty":
        errors.label = "タグ名が空です";
        break;
      case "lable is too long":
        errors.label = `タグ名が長すぎます`;
        break;
      case "label is a duplicate":
        errors.label = "そのタグ名は既に使用されています";
        break;
      case "tag is empty":
        errors.tag = "指定されたタグが存在しないためタグ名の変更に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      logger.error(e);
      res.status(400).json({
        status: {
          success: false,
          message: "タグ名の変更に失敗しました",
          errors }
      });
    }
  });
};

export const changeColor = (req, res, next) => {
  co(function* () {
    try {
      const { tag_id } = req.params;
      const { color } = req.body;

      if( color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/) === null ) throw new ValidationError("color is not valid");

      if( !mongoose.Types.ObjectId.isValid(tag_id) ) throw new ValidationError("tag_id is not valid");

      const tag = yield Tag.findById(tag_id);

      if (tag === null) throw new RecordNotFoundException("tag is empty");

      tag.color = color;
      const changedTag = yield tag.save();

      res.json({
        status: { success: true },
        body: changedTag
      });
    }
    catch (e) {
      let errors = {};

      switch (e.message) {
      case "tag_id is not valid":
        errors.tag_id = "タグIDが不正なため色の登録に失敗しました";
        break;
      case "tag is empty":
        errors.tag = "指定されたタグが存在しないため色の登録に失敗しました";
        break;
      case "color is not valid":
        errors.color = "色は16進数で指定してください";
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "色の登録に失敗しました",
          errors }
      });
    }
  });
};
