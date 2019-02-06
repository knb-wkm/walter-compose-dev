import co from "co";
import util from "util";
import mongoose from "mongoose";
import moment from "moment";
import * as _ from "lodash";

import AnalysisUseRateTotal from "../models/AnalysisUseRateTotal";
import AnalysisFileCount from "../models/AnalysisFileCount";
import AnalysisFolderCount from "../models/AnalysisFolderCount";
import AnalysisUseRateFolder from "../models/AnalysisUseRateFolder";
import AnalysisUseRateTag from "../models/AnalysisUseRateTag";
import AnalysisUseRateMimeType from "../models/AnalysisUseRateMimeType";
import AnalysisUseRateUser from "../models/AnalysisUseRateUser";

export const index = (req, res, next) => {
  co(function* () {
    try {
      const { reported_at } = req.query;

      if (reported_at === undefined || reported_at === null || reported_at === "") {
        throw "reported_at is empty";
      }

      if (! moment(reported_at, "YYYYMMDD") ) throw "reported_at is invalid";

      if ( moment(reported_at, "YYYYMMDD").format() > moment().format() ) {
        throw "reported_at is invalid";
      }

      let conditions = {
        tenant_id: res.user.tenant_id,
        reported_at: reported_at
      };

      let [
        useRateTotal,
        fileCount,
        folderCount,
        useRateFolder,
        useRateTag,
        useRateMimeType,
        useRateUser
      ] = yield [
        AnalysisUseRateTotal.find(conditions),
        AnalysisFileCount.find(conditions),
        AnalysisFolderCount.find(conditions),
        AnalysisUseRateFolder.find(conditions),
        AnalysisUseRateTag.find(conditions),
        AnalysisUseRateMimeType.find(conditions),
        AnalysisUseRateUser.find(conditions)
      ];

      if (useRateTotal.length > 0) {
        useRateTotal = [
          { name: "usage", label: "使用容量", value: useRateTotal[0].used },
          { name: "free", label: "空き容量", value: useRateTotal[0].free }
        ];
      }

      if (fileCount.length > 0) {
        fileCount = [{
          name: "fileCount", value: fileCount[0].count
        }];
      }

      if (folderCount.length > 0) {
        folderCount = [{
          name: "folderCount", value: folderCount[0].count
        }];
      }

      if (useRateFolder.length > 0) {
        useRateFolder = useRateFolder.map( f => ({
          name: f.dir_name, value: f.rate
        }));
      }

      if (useRateTag.length > 0) {
        useRateTag = useRateTag.map( t => {
          if (t.tag_label === null) {
            t.tag_label = "タグなし";
          }
          return { name: t.tag_label, value: t.rate };
        });
      }

      if (useRateMimeType.length > 0) {
        useRateMimeType = useRateMimeType.map( m => ({
          name: m.mime_type, value: m.rate
        }));
      }

      if (useRateUser.length > 0) {
        useRateUser = useRateUser.map( user => ({
          name: user.user_name, value: user.rate
        }));
      }

      res.json({
        status: { success: true },
        body: {
          useRateTotal,
          fileCount,
          folderCount,
          useRateFolder,
          useRateTag,
          useRateMimeType,
          useRateUser
        }
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "reported_at is empty":
        errors.reported_at = "日付が空のため容量の履歴の取得に失敗しました";
        break;
      case "reported_at is invalid":
        errors.reported_at = "日付が不正のため容量の履歴の取得に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }
      res.status(400).json({
        status: { success: false, message: "容量の履歴の取得に失敗しました", errors }
      });

    }
  });
};

export const periods = (req, res, next) => {
  co(function* () {
    try {
      let { start_date, end_date } = req.query;

      if (start_date === undefined || start_date === null || start_date === "") {
        throw "start_date is empty";
      }

      if (end_date === undefined || end_date === null || end_date === "") {
        throw "end_date is empty";
      }

      if ( moment(start_date, "YYYYMMDD").format() > moment(end_date, "YYYYMMDD").format() ) {
        throw "date_range is invalid";
      }

      let conditions = {
        tenant_id: res.user.tenant_id,
        $and: [
          { reported_at: { $gte: start_date } },
          { reported_at: { $lte: end_date }}
        ]
      };

      let usages = yield AnalysisUseRateTotal.find(conditions)
          .sort({ reported_at: 1 });

      if (usages.length > 0) {
        usages = usages.map( total => ({
          name: moment(total.reported_at, "YYYYMMDD").format("YYYY-MM-DD"),
          usage: total.used / 1024 / 1024 / 1024, // GB
          free: total.free / 1024 / 1024 / 1024   // GB
        }));
      }

      res.json({
        status: { success: true },
        body: usages
      });
    }
    catch (e) {
      let errors = {};

      switch (e) {
      case "start_date is empty":
        errors.start_date = "開始年月日が空のため容量の履歴の取得に失敗しました";
        break;
      case "end_date is empty":
        errors.end_date = "終了年月日が空のため容量の履歴の取得に失敗しました";
        break;
      default:
        errors.unknown = e;
        break;
      }

      res.status(400).json({ 
        status: { success: false, message: "容量の履歴の取得に失敗しました", errors }
      });
    }
  });
};
