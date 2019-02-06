import util from "util";
import co from "co";
import moment from "moment";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import logger from "../logger";
import esClient from "../elasticsearchclient";

import { SECURITY_CONF } from "../configs/server";

import Dir from "../models/Dir";
import File from "../models/File";
import Tenant from "../models/Tenant";
import User from "../models/User";
import RoleFile from "../models/RoleFile";
import AuthorityFile from "../models/AuthorityFile";

import { ILLIGAL_CHARACTERS, PERMISSION_VIEW_LIST } from "../configs/constants";

import { getAllowedFileIds, checkFilePermission, extractFileActions } from "./files";
import { find } from "lodash";
import * as constants from "../configs/constants";
import {
  ValidationError,
  RecordNotFoundException,
  PermisstionDeniedException
} from "../errors/AppError";

const { ObjectId } = mongoose.Types;

export const index = (req, res, next) => {
  co(function* () {
    try {
      let { dir_id } = req.query;

      // デフォルトはテナントのホーム
      if (dir_id === undefined ||
          dir_id === null ||
          dir_id === "") {
        dir_id = res.user.tenant.home_dir_id;
      }

      if (!ObjectId.isValid(dir_id)) throw "dir_id is invalid";

      const dirs = yield Dir.find({ descendant: dir_id })
            .sort({ depth: -1 });

      const files = yield File.find({ _id: dirs.map( dir => dir.ancestor ) })
            .select({ name: 1 });

      const sorted = dirs.map( dir => {
        return files.filter( file => file._id.toString() === dir.ancestor.toString() );
      }).reduce( (a, b) => a.concat(b));

      const withSep = [].concat.apply([], sorted.map( (dir, idx) => {
        return ( idx === 0 ) ? dir : [ "sep", dir ];
      }));

      res.json({
        status: { success: true },
        body: withSep
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "dir_id is invalid":
        errors.dir_id = "指定されたフォルダが存在しないためフォルダ階層の取得に失敗しました";
        break;
      case "dir_id is empty":
        errors.dir_id = "フォルダIDが不正のためフォルダ階層の取得に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          status: false,
          message: "フォルダ階層の取得に失敗しました",
          errors }
      });
    }
  });
};

export const tree = (req, res, next) => {
  co(function* () {
    try {
      const { root_id } = req.query;
      if (root_id === undefined ||
          root_id === null ||
          root_id === "") throw "root_id is empty";

      if (! ObjectId.isValid(root_id)) throw "root_id is invalid";

      const permittionIds = yield getAllowedFileIds(res.user._id, PERMISSION_VIEW_LIST);

      const root = yield File.findById(root_id);

      if (root === null) throw "root is empty";

      const dirs = yield Dir.aggregate([
        {
          $match: {
            ancestor: root._id, depth: 1,
            descendant: { $in: permittionIds }
          }
        },
        { $lookup:
          {
            from: "files",
            localField: "descendant",
            foreignField: "_id",
            as: "descendant"
          }
        },
        { $unwind: "$descendant" },
        {
          $match: {
            // inゴミ箱、削除のフォルダは対象外
            $nor: [
              { "descendant.dir_id": res.user.tenant.trash_dir_id },
              { "descendant.is_deleted": true }
            ]
          }
        }
      ]);

      if (dirs.length === 0) {
        res.json({
          status: { success: true },
          body: {
            _id: root._id,
            name: root.name,
            children: []
          }
        });
      } else {

        const children = dirs.map(dir => {
          if (dir.descendant.is_display) {
            return {
              _id: dir.descendant._id,
              name: dir.descendant.name
            };
          } else {
            return null;
          }
        }).filter( child => child !== null);

        res.json({
          status: { success: true },
          body: {
            _id: root._id,
            name: root.name,
            children: children
          }
        });

      }
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "root_id is empty":
        errors.root_id = "フォルダIDが空のためフォルダツリーの取得に失敗しました";
        break;
      case "root is empty":
        errors.root_id = "指定されたフォルダが存在しないためフォルダツリーの取得に失敗しました";
        break;
      case "root_id is invalid":
        errors.root_id = "フォルダIDが不正のためフォルダツリーの取得に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "フォルダツリーの取得に失敗しました",
          errors
        }
      });
    }
  });
};

export const create = (req, res, next) => {
  co(function*(){
    try {

      const { dir_name } = req.body;
      let dir_id = req.body.dir_id;

      if (dir_id === null ||
          dir_id === undefined ||
          dir_id === "") throw "dir_id is empty";

      if (! ObjectId.isValid(dir_id)) throw "dir_id is invalid";

      if (!dir_name) throw "dir_name is empty";

      if (dir_name.match( new RegExp(ILLIGAL_CHARACTERS.join("|") ))) throw "dir_name is invalid";

      const user = yield User.findById(res.user._id);

      const isPermitted = yield checkFilePermission( dir_id ,user._id , constants.PERMISSION_MAKE_DIR);

      if( isPermitted === false ) throw "permission denied";

      // フォルダ情報を構築
      const dir = new File();
      dir.name = dir_name;
      dir.modified = moment().format("YYYY-MM-DD HH:mm:ss");
      dir.is_dir = true;
      dir.dir_id = dir_id;
      dir.is_display = true;
      dir.is_star = false;
      dir.tags = [];
      dir.histories = [];
      dir.authorities = [];

      const role = yield RoleFile.findOne({
        tenant_id: mongoose.Types.ObjectId(res.user.tenant_id),
        name: "フルコントロール" // @fixme
      });

      // 作成したユーザが所有者となる
      const authority = new AuthorityFile();
      authority.users = user;
      authority.files = dir;
      authority.role_files = role;
      dir.authority_files = [ authority ];

      const history = {
        modified: moment().format("YYYY-MM-DD hh:mm:ss"),
        user: user,
        action: "新規作成",
        body: ""
      };

      dir.histories = dir.histories.concat(history);

      // authoritiesを構築するためセッションからユーザ情報を抽出
      const validationConditions = {
        name: dir_name,
        is_dir: true,
        dir_id: mongoose.Types.ObjectId(dir_id)
      };

      const _dir = yield File.find(validationConditions);

      if (_dir.length > 0) throw "name is duplication";

      const { newDir, newAuthority} = yield { newDir: dir.save(), newAuthority: authority.save() };

      // elasticsearch index作成
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(newDir._id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      const descendantDirs = yield Dir.find({ descendant: dir.dir_id }).sort({ depth: 1 });

      const conditions = { _id: descendantDirs.map( dir => dir.ancestor ) };
      const fields = { name: 1 };

      const files = yield File.find(conditions).select(fields);

      const sorted = descendantDirs.map( dir => files.filter( file => file.id == dir.ancestor )).reduce( (a,b) => a.concat(b));

      const findedDirs = [{ _id: dir._id, name: dir.name }].concat(sorted);

      const dirTree = findedDirs.map( (dir, idx, all) => {
        if (idx === 0) {
          return {
            ancestor: dir._id,
            descendant: dir._id,
            depth: idx
          };
        }
        else {
          return {
            ancestor: dir._id,
            descendant: all[0]._id,
            depth: idx
          };
        }
      });
      const savedDirs = yield Dir.collection.insert(dirTree);

      res.json({
        status: { success: true },
        body: dir
      });

    } catch (e) {
      let errors = {};

      switch (e) {
      case "dir_id is empty":
        errors.dir_id = "フォルダIDが空のためフォルダの作成に失敗しました";
        break;
      case "dir_id is invalid":
        errors.dir_id = "フォルダIDが不正のためフォルダの作成に失敗しました";
        break;
      case "dir_name is empty":
        errors.dir_name = "フォルダ名が空のためフォルダの作成に失敗しました";
        break;
      case "dir_name is invalid":
        errors.dir_name = "フォルダ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためフォルダの作成に失敗しました";
        break;
      case "name is duplication":
        errors.dir_name = "同名のフォルダが存在するためフォルダの作成に失敗しました";
        break;
      case "permission denied":
        errors.dir_id = "フォルダ作成権限がないためフォルダの作成に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      logger.error(errors);
      res.status(400).json({
        status: {
          success: false,
          message: "フォルダの作成に失敗しました",
          errors
        }
      });
    }
  });
};

export const move = (req, res, next) => {
  co(function* () {
    try {
      const moving_id = mongoose.Types.ObjectId(req.params.moving_id);  // 対象
      const destination_id = mongoose.Types.ObjectId(req.body.destinationDir._id);  // 行き先

      if(moving_id.toString() === destination_id.toString()) throw "target is the same as folder";

      const user = yield User.findById(res.user._id);

      const isPermitted =  yield checkFilePermission(moving_id, user._id, constants.PERMISSION_MOVE );
      if( !isPermitted ) throw "permission denied";

      const moved_dir = yield moveDir(moving_id, destination_id, user, "移動");

      // 移動したフォルダについて elasticsearch index更新
      const { tenant_id }= res.user;
      const updatedFile = yield File.searchFileOne({_id: mongoose.Types.ObjectId(moving_id) });
      yield esClient.createIndex(tenant_id,[updatedFile]);

      res.json({
        status: { success: true },
        body: moved_dir
      });

    } catch(e){
      let errors = {};
      switch (e) {
        case "dir_id is invalid":
          errors.dir_id = "指定されたフォルダが存在しないため移動に失敗しました";
          break;
        case "dir_id is empty":
          errors.dir_id = "フォルダIDが不正のため移動に失敗しました";
          break;
        case "target is the same as folder":
          errors.dir_id = "移動対象のフォルダと指定されたフォルダが同じため移動に失敗しました。";
          break;
        case "permission denied":
          errors.dir_id = "指定されたフォルダを移動する権限がないため移動に失敗しました";
          break;
        default:
          errors.unknown = e;
          break;
      }

      res.status(400).json({
        status: {
          success: false,
          status: false,
          message: "フォルダの移動に失敗しました",
          errors }
      });
    }
  });
};

export const moveDir = (moving, destination, user, action) =>{
  const _move = (moving_id, destination_id, user, action) => {
    return co(function* (){
      if(destination_id === undefined) throw "dir_id is invalid";
      yield Dir.find({
        depth: { $gt: 0 },
        descendant: moving_id
      }).remove();

      const dirs = (yield Dir.find({ descendant: destination_id, depth: { $gt: 0 } }))
        .map( dir => {
          return {
            ancestor: dir.ancestor,
            descendant: moving_id,
            depth: dir.depth + 1
          };
        });

      const insert_dirs = dirs.concat({
          ancestor: destination_id,
          descendant: moving_id,
          depth: 1
        });

      yield Dir.collection.insert(insert_dirs);

      const _moving = yield File.findById(moving_id);

      _moving.dir_id = destination_id;

      const history = {
        modified: moment().format("YYYY-MM-DD hh:mm:ss"),
        user: user,
        action: action,
        body: {
          _id: _moving._id,
          is_star: _moving.is_star,
          is_display: _moving.is_display,
          dir_id: _moving.dir_id,
          is_dir: _moving.is_dir,
          size: _moving.size,
          mime_type: _moving.mime_type,
          blob_path: _moving.blob_path,
          name: _moving.name,
          meta_infos: _moving.meta_infos,
          tags: _moving.tags,
          is_deleted: _moving.is_deleted,
          modified: _moving.modified,
          __v: _moving.__v
        }
      };

      _moving.histories = _moving.histories.concat(history);

      const moved_dir = yield _moving.save();
      return moved_dir;
    });
  };
  return co(function* () {
    // 子のIDを取得する
    const childrenIds = (yield Dir.find({ancestor: moving, depth: { $gt: 0 }}).sort({"depth":1})).map(dir => dir.descendant)  ;
    // 子の現在位置を取得する
    const childrenDirs = yield File.find({_id: {$in: childrenIds }}).select({_id:1,dir_id:1});
    // 対象を移動する
    const moved_dir = yield _move(moving, destination, user, action);

    // 子を同じ位置に移動し直す
    let moved_dirs = [];
    for( const idx in childrenIds ){
      let child = find(childrenDirs, {_id:childrenIds[idx]});
      moved_dirs.push( yield _move(child._id, child.dir_id , user, action) );
    }

    return [ moved_dir, ...moved_dirs];
  });
};

export const getDescendants = (dir_id) => {

}


export const view = (req, res, next) => {
  co(function* () {
    try {
      // TODO: 詳細の取得処理はfiles.viewとほぼ同じなので共通化する.返却値に差があるので注意
      let { dir_id } = req.params;

      // デフォルトはテナントのホーム
      if (dir_id === undefined ||
         dir_id === null ||
         dir_id === "" ||
         dir_id === "null") {
        dir_id = res.user.tenant.home_dir_id;
      }
      if( !mongoose.Types.ObjectId.isValid( dir_id ) ) throw new ValidationError("ファイルIDが不正なためファイルの取得に失敗しました");

      const file_ids = yield getAllowedFileIds(
        res.user._id, constants.PERMISSION_VIEW_DETAIL
      );

      if (!file_ids.map( f => f.toString() ).includes(dir_id.toString())) {
        throw new PermisstionDeniedException("指定されたファイルが見つかりません");
      }

      const conditions = {
        $and:[
          {_id: mongoose.Types.ObjectId(dir_id)},
          {_id: {$in : file_ids}}
        ]
      };

      const file = yield File.searchFileOne(conditions);

      if (file === null || file === "" || file === undefined) {
        throw new RecordNotFoundException("指定されたファイルが見つかりません");
      }

      if (file.is_deleted) {
        throw new RecordNotFoundException("ファイルは既に削除されているためファイルの取得に失敗しました");
      }

      const actions = extractFileActions(file.authorities, res.user);

      res.json({
        status: { success: true },
        body: { ...file, actions }
      });

    }
    catch (e) {
      logger.error(e);

      res.status(400).json({
        status: { success: false,message:"ファイルの取得に失敗しました", errors: e }
      });
    }
  });
};
