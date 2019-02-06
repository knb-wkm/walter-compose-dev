import express from "express";
import bodyParser from "body-parser";
import util from "util";
import co from "co";
import logger from "../../lib/logger";
import supertest from "supertest";
import defaults from "superagent-defaults";

// router
import Router from "../../lib/routes";

// models
import Tenant from "../../lib/models/Tenant";
import File from "../../lib/models/File";
import Tag from "../../lib/models/Tag";

const app = express();
app.use(bodyParser.json());
app.use("/", Router);

const request = defaults(supertest(app));

const task = () => {
  co(function* () {
    try {
      logger.info("非表示タグのついたファイルを非表示属性に変更するパッチを適用開始");
      // console.log("非表示タグのついたファイルを非表示属性に変更するパッチを適用開始");

      if (! process.argv[3]) throw new Error("引数にテナント名を指定する必要があります");
      const tenant_name = process.argv[3];

      const tenant = yield Tenant.findOne({ name: tenant_name });
      if (tenant === null) throw new Error(`指定されたテナントは存在しません ${tenant_name}`);

      const targetTag = yield Tag.findOne({
        label: "非表示",
        tenant_id: tenant._id
      });

      const targetFiles = yield File.find({
        tags: targetTag._id,
        unvisible: false
      });

      console.log(`非表示パッチ適用対象のレコード数: ${targetFiles.length}`);
      console.log(`非表示パッチ適用対象のレコード: ${targetFiles}`);

      logger.info(`非表示パッチ適用対象のレコード数: ${targetFiles.length}`);
      logger.info(`非表示パッチ適用対象のレコード: ${targetFiles}`);

      let authData;

      if (process.env.NODE_ENV === "production") {
        if (! process.argv[4]) throw new Error("引数にログイン名が必要");
        if (! process.argv[5]) throw new Error("引数にログイン名が必要");

        authData = {
          account_name: process.argv[4],
          password: process.argv[5],
          tenant_name: tenant.name
        };

      } else {
        authData = {
          account_name: "taro",
          password: "test",
          tenant_name: tenant_name
        };
      }

      const authRes = yield new Promise( (resolve, reject) => {
        request
          .post("/api/login")
          .send(authData)
          .end( (err, res) => {
            if (err) reject(err);
            resolve(res);
          });
      });

      const { user, token } = authRes.body.body;

      if (! user) throw new Error("ログイン時のユーザ情報取得に失敗");
      if (! token) throw new Error("ログイントークンの取得に失敗");

      request.set("x-auth-cloud-storage", token);

      // 非表示状態トグルのapiをコール
      yield targetFiles.map( file => {
        return new Promise( (resolve, reject) => {
          request
            .patch(`/api/v1/files/${file._id}/toggle_unvisible`)
            .end( (err, res) => {
              if (err) reject(err);
              resolve(res);
            });
        });
      });

      logger.info("非表示タグのついたファイルを非表示属性に変更するパッチが適用完了");
      console.log("非表示タグのついたファイルを非表示属性に変更するパッチが適用完了");
      process.exit();
    }
    catch (e) {
      logger.error(e);
      console.log(e);
      process.exit();
    }
  });
};

export default task;
