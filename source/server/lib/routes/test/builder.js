import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import { exec } from "child_process";
import { SERVER_CONF } from "../../configs/server";

// express初期化
const app = express();
app.use(bodyParser.json({ limit: "100MB" }));

// mongodbのurl(mongodb://xxxx)
const url = SERVER_CONF.development.url;
const db_name = SERVER_CONF.development.db_name;
const mongoUrl = `${url}/${db_name}`;

// mongoをinitするコマンド
const batch_path = path.join(__dirname, "../../../jobs/loadTestData.js");
const db_host = SERVER_CONF.development.db_host;
const command = `/usr/local/bin/mongo ${db_host}/${db_name} --quiet ${batch_path}`;

// mochaのbeforeはPromiseを返却する必要があるので
const initdbPromise = new Promise( (resolve, reject) => {
  exec(command, (err, stdout, stderr) => {
    if (err) return reject({ err, stderr });
    return resolve();
  });
}).then(res =>{
  // elasticsearchのmapping
  return new Promise( (resolve, reject) => {
    exec("npm run init-elasticsearch", (err, stdout, stderr) => {
      if (err) return reject({ err, stderr });
      return resolve();
    });
  });
});

// とりあえず
const authData = {
  account_name: "taro",
  name: "taro",
  email: "taro",
  password: "test",
  tenant_name: "test"
};

export { app, mongoUrl, initdbPromise, authData };
