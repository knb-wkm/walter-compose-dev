import fs from "fs";
import { Router } from "express";
import mongoose from "mongoose";
import co from "co";
import Excel from "exceljs";
import {get,find,findIndex} from "lodash";
import logger from "../logger";

// controllers
import * as filesController from "./files";
import * as displayItemsController from "./displayItems";

// models
import Tag from "../models/Tag";
import RoleFile from "../models/RoleFile";

const router = Router();

export const index = (req, res, next) => {
  co(function* () {
    try {
      const files = yield filesController.index(req, res, next, true, true);
      const displayItems = yield displayItemsController.excel(req, res, next, true);

      const tags = yield Tag.find({
        $or: [
          { tenant_id: res.user.tenant_id },
          { user_id: res.user._id }
        ]
      });

      const roles = yield RoleFile.find({ tenant_id: res.user.tenant_id });

      const readStream = yield exportExcelBook(displayItems,tags,roles,files);

      fs.createReadStream(readStream.path)
      .on("data", data => res.write(data) )
      .on("end", () => res.end() );
    }
    catch (e) {
      // TODO: エラー処理を追加する
      let errors = {};

      switch (e) {
      default:
        errors.unknown = e;
        break;
      }
      logger.info(e);
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const search = (req, res, next) => {
  co(function* () {
    try {
      const files = yield filesController.search(req, res, next, true);
      const displayItems = yield displayItemsController.excel(req, res, next, true);

      const tags = yield Tag.find({
        $or: [
          { tenant_id: res.user.tenant_id },
          { user_id: res.user._id }
        ]
      });

      const roles = yield RoleFile.find({ tenant_id: res.user.tenant_id });

      const readStream = yield exportExcelBook(displayItems,tags,roles,files);
      fs.createReadStream(readStream.path)
      .on("data", data => res.write(data) )
      .on("end", () => res.end() );
    }
    catch (e) {
      // TODO: エラー処理を追加する
      let errors = {};

      switch (e) {
      default:
        errors.unknown = e;
        break;
      }
      logger.info(e);
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};

export const searchDetail = (req, res, next) => {
  co(function* () {
    try {
      const files = yield filesController.searchDetail(req, res, next, true);
      const displayItems = yield displayItemsController.excel(req, res, next, true);

      const tags = yield Tag.find({
        $or: [
          { tenant_id: res.user.tenant_id },
          { user_id: res.user._id }
        ]
      });

      const roles = yield RoleFile.find({ tenant_id: res.user.tenant_id });

      const readStream = yield exportExcelBook(displayItems,tags,roles,files);
      fs.createReadStream(readStream.path)
      .on("data", data => res.write(data) )
      .on("end", () => res.end() );
    }
    catch (e) {
      // TODO: エラー処理を追加する
      let errors = {};

      switch (e) {
      default:
        errors.unknown = e;
        break;
      }
      logger.info(e);
      res.status(400).json({
        status: { success: false, errors }
      });
    }
  });
};
// private ---
const exportExcelBook = co.wrap( function*(displayItems, tags,roles, files){
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('ファイル一覧');

  const fill_styles_header = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'CCCCCC' }
  };

  const fill_color = {
    default: 'CCCCCC',
    meta: 'CCCCCC',
    tag: 'CCCCCC',
    role: '8ee0ea'
  };

  const fill_styles_body_odd = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ffffff' }
  };
  const fill_styles_body_even = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'EFEFEF' }
  };
  const cel_width = 20;

  const headers = displayItems.filter(item => (item.name !== 'file_checkbox' && item.name !== 'action' && item.name !== "authorities" && item.name !== "tag")).map(item =>{
    if(item.meta_info_id === null){
      return {
        name:item.name,
        label:item.label,
        type:"default"
      };
    }else{
      return {
        name:item.name,
        label:item.label,
        meta_info_id:item.meta_info_id,
        type:"meta"
      };
    }
  });

  let header_tags = [];
  // tagが出力対象の場合
  if( findIndex(displayItems, { name:"tag" }) >= 0 ){

    header_tags = tags.map(tag => {

      let color = tag.color.replace('#','');
      if( color.length === 3 ){
        color = color.replace(/([0-9a-zA-Z])([0-9a-zA-Z])([0-9a-zA-Z])/g ,"$1$1$2$2$3$3" );
      }
      return {
        name: "tags",
        label: tag.label,
        type:"tag",
        tag_id: tag._id,
        color: color
      };
    });
  }
// console.log(roles);
  let header_authority = [];
  if( findIndex(displayItems, { name:"authorities" }) >= 0 ){
    header_authority = roles.map(role => {
      return {
        name: "roles",
        label: role.name,
        type:"role",
        role_id: role._id
      };
    });
  }

  const column =  [...headers, ...header_authority, ...header_tags];
// console.log(column);
  // header
  for (let j = 0; j < column.length; j++ ) {
    const col = j + 1;
    worksheet.getCell(1, col ).value = column[j].label;
    const fill_style = {
      type: fill_styles_header.type,
      pattern: fill_styles_header.pattern,
      fgColor: column[j].type === "tag" ? { argb: column[j].color } :  { argb: fill_color[column[j].type] }
    };
    worksheet.getCell(1, col ).fill = fill_style;
    worksheet.getCell(1, col ).border = {bottom:{ style: "thin" }};
    worksheet.getColumn( col ).width = cel_width;
    worksheet.getCell(1, col ).alignment = { vertical: 'middle', horizontal: 'center' };
  }

  // body
  for (let i = 0; i < files.length; i++){
    const line = i + 2;
    for (let j = 0; j < column.length; j++ ) {
      let value = "";

      switch (column[j].type) {
        case "meta":
          const meta = find( files[i].meta_infos ,{_id: column[j].meta_info_id} );
          value =  meta === undefined ? "" : meta.value;
          break;
        case "tag":
          value = ( findIndex(files[i].tags, { _id: column[j].tag_id }) >= 0 ) ? "○" : "";
        break;
        case "role":
          const file_role = files[i].authorities
            .filter(authority => (authority.role_files._id.toString() === column[j].role_id.toString()))
            .map(authority => authority.users.name ).join();
          value = file_role;
          break;
        default:
          value =  get(files[i], column[j].name);
          break;
      }

      if( column[j].name === "dir_route" && value === "") value = "Top";

      const col = j + 1;
      worksheet.getCell(line, col ).value = value;
      worksheet.getCell(line, col ).fill = (line % 2 === 0) ? fill_styles_body_even : fill_styles_body_odd ;

    }

  }


  //出力
  const stream = fs.createWriteStream("/tmp/stream.tmp");
  yield workbook.xlsx.write(stream);

  return stream;
});