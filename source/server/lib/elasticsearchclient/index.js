import util from "util";
import elasticsearch from "elasticsearch";
import { ELASTICSEARCH_CONF } from "../configs/server";
import co from "co";
import { ELASTIC_INDEXING_TIMEOUT } from "../configs/constants";

const mode = process.env.NODE_ENV;

let erasticsearchUrl;
let erasticsearchErrorLevel;

switch (mode) {

  case "integration":
    erasticsearchUrl = `${ELASTICSEARCH_CONF.integration.host}:${ELASTICSEARCH_CONF.integration.port}`;
    erasticsearchErrorLevel = ELASTICSEARCH_CONF.integration.logLevel;
    break;

  case "production":
    if (! process.env.ELASTIC_HOST_NAME) throw new Error("env.ELASTIC_HOST_NAME is not set");

    erasticsearchUrl = `${ELASTICSEARCH_CONF.production.host}:${ELASTICSEARCH_CONF.production.port}`;
    erasticsearchErrorLevel = ELASTICSEARCH_CONF.production.logLevel;
    break;

  default:
    erasticsearchUrl = `${ELASTICSEARCH_CONF.development.host}:${ELASTICSEARCH_CONF.development.port}`;
    erasticsearchErrorLevel = ELASTICSEARCH_CONF.development.logLevel;
    break;
  }

const esClient = new elasticsearch.Client({
  host: erasticsearchUrl,
  log: erasticsearchErrorLevel,
  timeout: ELASTIC_INDEXING_TIMEOUT
});

esClient.createIndex = co.wrap(
  function* (tenant_id,files){
    try {
      const bulkBody = [];
      files.forEach(file=>{
        bulkBody.push({
          index:{
            _index: tenant_id,
            _type: "files",
            _id: file._id
          }
        });
        const esFile = {
          _id: file._id,
          name: file.name,
          mime_type: file.mime_type,
          size: file.size,
          is_dir: file.is_dir,
          dir_id: file.dir_id,
          is_display: file.is_display,
          is_star: file.is_star,
          is_trash: file.is_trash,
          is_crypted: file.is_crypted,
          is_deleted: file.is_deleted,
          // modified: file.modified,
          preview_id: file.preview_id,
          sort_target: file.sort_target,
          unvisible: file.unvisible
        };

        file.meta_infos.forEach(meta =>{
          esFile[ meta._id.toString() ] = meta.value;
        });

        // タグ検索(2018-01-05:マスタ更新に対応できないのでコメントアウト)
        // file.tags.forEach(tag => {
        //   esFile[tag._id.toString()] = tag.label;
        // });

        esFile.actions = {};

        // 簡易検索でユーザ名で検索するためユーザ名を文字列として保持する(2018-01-05:マスタ更新に対応できないのでコメントアウト)
        // esFile.users = "";

        // 詳細検索ではuser._idで引き当てたい
        file.authorities.forEach((authority,index) => {
          authority.actions.forEach((action, idx) => {
            if(esFile.actions[action._id] === undefined ) esFile.actions[action._id] = [];
            esFile.actions[action._id].push(authority.users._id);
          });
          // esFile.users += (esFile.users==="" ? "": " ") + authority.users.name;
        });
        bulkBody.push({
          file: esFile
        });

      });

      const result = yield esClient.bulk({ refresh:"true", body:bulkBody });
      if(result.errors) throw result.items[0].index;

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    }

  }
);

export default esClient;
