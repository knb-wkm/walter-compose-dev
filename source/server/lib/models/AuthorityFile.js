import mongoose, { Schema } from "mongoose";
import { logger } from "../logger";
import co from "co";

mongoose.Promise = global.Promise;

const AuthoritySchema = Schema({
  files : Schema.Types.ObjectId,
  role_files : { type:Schema.Types.ObjectId, ref:'role_files'},
  users : { type:Schema.Types.ObjectId, ref:'users'},
  groups : { type:Schema.Types.ObjectId, ref:'groups'}
});

/**
 * Authority の roles から actions を取得する
 * @param Object condition
 * @returns Array
 */
AuthoritySchema.statics.getActions = function(condition){
  const _this = this;
  return co(function* (){
    try {
      const authorityActions = yield _this.aggregate(
        { $match: condition},
        { $lookup: {
          from: "role_files",
          localField: "role_files",
          foreignField: "_id",
          as: "roles"
        }},
        { $unwind: "$roles" },
        { $project: {
            roles : {
              $filter: {
                input: "$roles.actions",
                as : "action",
                cond: {}
              }
            },
            _id : false
          },
        },
        { $unwind: "$roles" },
        { $group: { _id:"$roles" }},  // 重複をまとめる
        { $lookup: {
          from: "actions",
          localField: "_id",
          foreignField: "_id",
          as: "actions"
        }},
        { $project: { actions:1,_id:false}},
        { $unwind: "$actions" },
      );

      const actions = authorityActions.map(action => action.actions)

      return new Promise((resolve,reject) => resolve(actions) )
    } catch (error) {
      throw error;
    }
  })
};

const AuthorityFile = mongoose.model("authority_files", AuthoritySchema, "authority_files");

export default AuthorityFile;
