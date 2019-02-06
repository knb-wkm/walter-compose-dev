import mongoose from "mongoose";
import co from "co";
import AppSetting from "../models/AppSetting";
import Tenant from "../models/Tenant";

export const index = (req, res, next) => {
  co(function* () {
    try {
      const { tenant_id } = res.user;

      const tenant = yield Tenant.findById(tenant_id);

      if (tenant === null) throw new Error("指定されたテナントが存在しないため設定の取得に失敗しました");

      const settings = yield AppSetting.find({ tenant_id: tenant._id });

      res.json({
        status: { success: true },
        body: settings
      });
    }
    catch (e) {
      res.status(400).json({
        status: { success: false }
      });
    }
  });
};
