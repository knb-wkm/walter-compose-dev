import mongoose from "mongoose";
import co from "co";

import MetaInfo from "../models/MetaInfo";
import Tenant from "../models/Tenant";
import * as constants from "../configs/constants";

const KEY_TYPE_META = "meta";
const VALUE_TYPES = [
  {name: "String"},
  {name: "Number"},
  {name: "Date"}
];

export const index = (req, res, next) => {
  co(function* () {
    try {
      const { tenant_id } = res.user;
      if (tenant_id === undefined ||
          tenant_id === null ||
          tenant_id === "") throw "tenant_id is empty";

      const tenant = yield Tenant.findById(tenant_id);
      if (tenant === null) throw "tenant is empty";

      const conditions = {
        tenant_id: tenant._id
      };

      const meta_infos = yield MetaInfo.find(conditions);

      res.json({
        status: { success: true },
        body: meta_infos
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "tenant_id is empty":
        errors.tenant_id = e;
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

export const add = (req, res, next) => {
  co(function*() {
    try{

      const { metainfo } = req.body;
      const { tenant_id } = res.user;

      if (metainfo.name === undefined ||
          metainfo.name === null ||
          metainfo.name === "") throw "name is empty";

      if (metainfo.name.length >= constants.MAX_STRING_LENGTH) {
        throw "name is too long";
      }

      const checkDuplicateName = yield MetaInfo.findOne({ name: metainfo.name, tenant_id: tenant_id });
      if (checkDuplicateName !== null) throw "name is duplicate";

      if (metainfo.label === undefined ||
          metainfo.label === null ||
          metainfo.label === "") throw "label is empty";

      if (metainfo.label.length >= constants.MAX_STRING_LENGTH) {
        throw "label is too long";
      }

      if (metainfo.value_type === undefined ||
          metainfo.value_type === null ||
          metainfo.value_type === "") throw "value_type is empty";

      if (! VALUE_TYPES.map( t => t.name).includes(metainfo.value_type)) {
        throw "value_type is invalid";
      }

      metainfo.tenant_id = tenant_id;

      let _metainfo = yield MetaInfo.findOne({ label: metainfo.label, tenant_id: tenant_id });
      if(_metainfo !== null) throw "label is duplicate";

      const __metainfo = new MetaInfo(metainfo);
      const createdMetainfo = yield __metainfo.save();

      res.json({
        status: { success: true},
        body: createdMetainfo
      });
    }catch(err){
      let errors = {};
      switch (err) {
      case "name is empty":
        errors.name = "メタ情報名が空のためメタ情報の登録に失敗しました";
        break;
      case "name is too long":
        errors.name = `メタ情報名が規定文字数(${constants.MAX_STRING_LENGTH})を超過したためメタ情報の登録に失敗しました`;
        break;
      case "name is duplicate":
        errors.name = "指定されたメタ情報名は既に登録されているためメタ情報の登録に失敗しました";
        break;
      case "label is empty":
        errors.label = "表示名が空のためメタ情報の登録に失敗しました";
        break;
      case "label is too long":
        errors.label = `表示名が規定文字数(${constants.MAX_STRING_LENGTH})を超過したためメタ情報の登録に失敗しました`;
        break;
      case "label is duplicate":
        errors.label = "指定された表示名は既に登録されているためメタ情報の登録に失敗しました";
        break;
      case "value_type is invalid":
        errors.value_type = "データ型が不正のためメタ情報の登録に失敗しました";
        break;
      case "value_type is empty":
        errors.value_type = "データ型が空のためメタ情報の登録に失敗しました";
        break;
      default:
        errors = err;
        break;
      }
      res.status(400).json({
        status: {
          success: false,
          message: "メタ情報の登録に失敗しました",
          errors
        }
      });
    }

  });
};

export const view = (req, res, next) => {
  co(function* () {
    try{
      const { tenant_id } = res.user;
      const { metainfo_id } = req.params;
      if (metainfo_id === undefined ||
        metainfo_id === null ||
        metainfo_id === ""
      ) throw "metainfo_id is empty";

      if (! mongoose.Types.ObjectId.isValid(metainfo_id)) throw "metainfo_id is invalid";

      const metainfo = yield MetaInfo.findById(metainfo_id);
      if (metainfo == null) throw "metainfo is empty";
      if(metainfo.tenant_id.toString() !== tenant_id.toString() ) throw "tenant_id is diffrent";

      res.json({
        status: { success: true},
        body: {
          ...metainfo.toObject()
        }
      });

    }
    catch(err){
      let errors = {};

      switch (err) {
      case "metainfo_id is invalid":
        errors.metainfo_id = "メタ情報IDが不正のためメタ情報の取得に失敗しました";
        break;
      case "metainfo_id is empty":
        errors.metainfo_id = err;
        break;
      case "metainfo is empty":
        errors.metainfo = err;
        break;
      default:
        errors.unknown = err;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "メタ情報の取得に失敗しました",
          errors
        }
      });
    }
  });
};

export const updateLabel = (req, res, next) => {
  co(function* (){
    try{
      const { tenant_id } = res.user;
      const { metainfo_id } =req.params;
      const { label } = req.body;

      if (label === null ||
          label === undefined ||
          label === "") throw "label is empty";

      if (label.length >= constants.MAX_STRING_LENGTH) throw "label is too long";

      const metainfo = yield MetaInfo.findById(metainfo_id);
      if(metainfo === null) throw "metainfo not found";
      if(metainfo.tenant_id.toString() !== tenant_id.toString() ) throw "tenant_id is diffrent";

      const duplicateCheck = yield MetaInfo.findOne({ label: label, tenant_id: tenant_id });
      if (duplicateCheck !== null) throw "label is duplicate";

      metainfo.label = label;
      const changedMetainfo = yield metainfo.save();

      res.json({
        status: { success: true},
        body: changedMetainfo
      });

    }
    catch(err) {
      let errors = {};

      switch(err){
      case "label is empty":
        errors.label = "表示名が空です";
        break;
      case "label is too long":
        errors.label = `表示名が規定文字数(${constants.MAX_STRING_LENGTH})を超過したため表示名の更新に失敗しました`;
        break;
      case "label is duplicate":
        errors.label = "指定された表示名は既に登録されているため表示名の更新に失敗しました";
        break;
      default:
        errors.unknown = err;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "メタ情報の表示名更新に失敗しました",
          errors
        }
      });
    }
  });
}


export const updateName = (req, res, next) => {
  co(function* (){
    try{
      const { tenant_id } = res.user;
      const { metainfo_id } =req.params;
      const { name } = req.body;

      if (name === null ||
          name === undefined ||
          name === "") throw "name is empty";

      if (name.length >= constants.MAX_STRING_LENGTH) throw "name is too long";

      const metainfo = yield MetaInfo.findById(metainfo_id);
      if(metainfo === null) throw "metainfo not found";
      if(metainfo.tenant_id.toString() !== tenant_id.toString() ) throw "tenant_id is diffrent";

      const duplicateCheck = yield MetaInfo.findOne({ name: name, tenant_id: tenant_id });
      if (duplicateCheck !== null) throw "name is duplicate";

      metainfo.name = name;
      const changedMetainfo = yield metainfo.save();

      res.json({
        status: { success: true},
        body: changedMetainfo
      });

    }
    catch(err) {
      let errors = {};

      switch(err){
      case "name is empty":
        errors.name = "表示名が空です";
        break;
      case "name is too long":
        errors.name = `表示名が規定文字数(${constants.MAX_STRING_LENGTH})を超過したため表示名の更新に失敗しました`;
        break;
      case "name is duplicate":
        errors.name = "指定された表示名は既に登録されているため表示名の更新に失敗しました";
        break;
      default:
        errors.unknown = err;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "メタ情報の表示名更新に失敗しました",
          errors
        }
      });
    }
  });
};


export const valueType = (req, res, next) => {
  res.json({
    status: {
      seccusee: true,
      value_type: VALUE_TYPES
    }
  });
}
