import mongoose from "mongoose";
import co from "co";
import Menu from "../models/Menu";

export const index = (req, res, next) => {
  co(function* () {
    try {
      const menus = yield Menu.find();

      res.json({
        status: { success: true },
        body: menus
      });
    }
    catch (e) {
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
