import co from "co";
import mongoose from "mongoose";

import Tenant from "../models/Tenant";

export const view = (req, res, next) => {
  co(function* () {
    try {
      const { tenant_id } = req.params;

      if (tenant_id === null ||
          tenant_id === undefined ||
          tenant_id === "") throw "tenant_id is empty";

      const tenant = yield Tenant.findById(tenant_id);
      if (tenant === null) throw "tenant is empty";

      res.json({
        status: { success: true },
        body: tenant
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
