import mongoose from "mongoose";
import co from "co";

import * as tasks from "./tasks/index";
import { SERVER_CONF } from "../lib/configs/server";
import * as constants from "../lib/configs/constants";
import logger from "../lib/logger";

// 環境変数
// 開発 => development、社内テスト => integration、本番 => production
const mode = process.env.NODE_ENV;

let url;
let db_name;

switch (mode) {
  
case "integration":
  url = SERVER_CONF.integration.url;
  db_name = SERVER_CONF.integration.db_name;
  break;

case "production":
  url = SERVER_CONF.production.url;
  db_name = SERVER_CONF.production.db_name;
  break;

default:
  url = SERVER_CONF.development.url;
  db_name = SERVER_CONF.development.db_name;
  break;
}

mongoose.connect(`${url}/${db_name}`, {useMongoClient: true}).then( () => {
  const args = process.argv[2];
  switch (args) {
  case "analyze":
    tasks.AnalyzeTask();
    break;
    case "perfTest":
    tasks.PerfTest();
    break;
  case "addTenant":
    tasks.addTenantTask();
    break;
  case "initElasticsearch":
    tasks.initElasticsearchTask();
    break;
  case "moveUnvisibleFiles":
    tasks.moveInvisibleFilesTask();
    break;
  case "createAdmin":
    tasks.createAdminTask();
    break;
    break;
  case "deleteAdmin":
    tasks.deleteAdminTask();
    break;
  default:
    throw new Error("引数が不正です。");
  }
}).catch(err => {

  logger.info(err);
  process.exit();

});
