import co from "co";
import { Types } from "mongoose";

import DownloadInfo from "../models/DownloadInfo";
import AppSetting from "../models/AppSetting";

export const index = (req, res, next) => {
  co(function*(){
    try {
      const { downloadinfo_type } = req.params;
      const { tenant_id } = res.user;

      if (downloadinfo_type === undefined ||
        downloadinfo_type === null ||
        downloadinfo_type === "") throw "type is empty";

      const downloadinfo = yield DownloadInfo.findOne({
        tenant_id:tenant_id,
        type: downloadinfo_type
      });

      if(downloadinfo === undefined || downloadinfo === null || downloadinfo === "") throw "downloadinfo is undefined";


      res.json({
        status:{ success:true },
        body: {
          downloadinfo,
          extensionTarget:downloadinfo.extensionTarget
        }
      });
    } catch (e) {
      res.status(400).json();
    }
  });
};
export const add = (req, res, next) => {
  co(function*(){
    try {

      const { downloadinfo } = req.body;
      const { tenant_id } = res.user;

      if (downloadinfo.value === undefined ||
        downloadinfo.value === null ||
        downloadinfo.value === "") throw "value is empty";

      if (downloadinfo.type === undefined ||
        downloadinfo.type === null ||
        downloadinfo.type === "") throw "type is empty";

      const _downloadinfo = yield DownloadInfo.find({
        tenant_id: Types.ObjectId(tenant_id),
        type: downloadinfo.type
      }).count();

      if(_downloadinfo > 0) throw "downloadinfo is already exists";

      const new_downloadinfo = new DownloadInfo();
      new_downloadinfo.tenant_id = tenant_id;
      new_downloadinfo.type = downloadinfo.type;
      new_downloadinfo.value = downloadinfo.value;

      const saved_downloadinfo = yield new_downloadinfo.save();

      res.json({
        status:{ success:true },
        body: saved_downloadinfo
      });
    } catch (e) {
      let errors = {};

      switch (e) {
        case "":

          break;

        default:
          errors.unknown = e;
          break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "ダウンロード情報の登録に失敗しました",
          errors
        }
      });
    }
  });
};

// ひとまずはvalueのみ
export const update = (req, res, next) => {
  co(function*(){
    try {

      const { downloadinfo } = req.body;
      const { downloadinfo_id } = req.params;
      const { tenant_id } = res.user;

      if (downloadinfo.value === undefined ||
        downloadinfo.value === null ||
        downloadinfo.value === "") throw "value is empty";

      const _downloadinfo = yield DownloadInfo.findOne({
          tenant_id: Types.ObjectId(tenant_id),
          _id: Types.ObjectId(downloadinfo_id)
      });

      if(_downloadinfo === undefined || _downloadinfo === null || _downloadinfo === "") throw "downloadinfo is undefined";

      _downloadinfo.value = downloadinfo.value;

      const changed_downloadinfo = yield _downloadinfo.save();

      res.json({
        status:{ success:true },
        body: changed_downloadinfo,
        test:"update"
      });
    } catch (e) {
      let errors = {};

      switch (e) {
        case "":

          break;

        default:
          errors.unknown = e;
          break;
      }

      res.status(400).json({
        status: {
          success: false,
          message: "ダウンロード情報の登録に失敗しました",
          errors
        }
      });
    }
  });
};