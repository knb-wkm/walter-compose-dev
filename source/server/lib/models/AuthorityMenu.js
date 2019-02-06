import mongoose, { Schema } from "mongoose";
import { logger } from "../logger";
import co from "co";

mongoose.Promise = global.Promise;

const AuthorityMenuSchema = Schema({
  role_menus : { type:Schema.Types.ObjectId, ref:'role_menus'},
  users : { type:Schema.Types.ObjectId, ref:'users'},
  groups : { type:Schema.Types.ObjectId, ref:'groups'}
});

/**
 * Authority の roles から actions を取得する
 * @param Object condition
 * @returns Array
 */
AuthorityMenuSchema.statics.getMenus = function(condition){
  const _this = this;
  return co(function* (){
    try {
      const authorityMenus = yield _this.aggregate(
        { $match: condition},
        { $lookup: {
          from: "role_menus",
          localField: "role_menus",
          foreignField: "_id",
          as: "roles"
        }},
        { $unwind: "$roles" },
        { $project: {
            roles : {
              $filter: {
                input: "$roles.menus",
                as : "menu",
                cond: {}
              }
            },
            _id : false
          },
        },
        { $unwind: "$roles" },
        { $group: { _id:"$roles" }},  // 重複をまとめる
        { $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "_id",
          as: "menus"
        }},
        { $project: {
          _id:0,
          menus: { $arrayElemAt: ["$menus", 0]  },
        }}
      );

      const menus = authorityMenus.map(menu => menu.menus);

      return new Promise((resolve,reject) => resolve(menus) );
    } catch (error) {
      throw error;
    }
  });
};

const AuthorityMenu = mongoose.model("authority_menus", AuthorityMenuSchema, "authority_menus");

export default AuthorityMenu;
