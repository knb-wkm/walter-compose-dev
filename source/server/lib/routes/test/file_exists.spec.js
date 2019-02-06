import util from "util";
import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import * as _ from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

// model
import User from "../../models/User";
import { resolve } from "url";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/files";
const login_url = "/api/login";

const request = defaults(supertest(app));
var user;
var meta_infos;

describe(base_url, () => {
  let uploadFile = {
    name: "file_exists_test_01.txt",
    size: 4,
    mime_type: "text/plain",
    base64: "data:text/plain;base64,Zm9vCg==",
    checksum: "8f3bee6fbae63be812de5af39714824e"
  };

  before ( done => {
    initdbPromise.then( () => {
      return new Promise( (resolve, reject) => {
        request.post(login_url)
          .send(authData)
          .end( (err, res) => {
            user = res.body.body.user;
            request.set('x-auth-cloud-storage', res.body.body.token);
            resolve();
          });
      });
    }).then( res => {
      const uploadFiles = {
        dir_id: user.tenant.home_dir_id,
        files: [ uploadFile ]
      };

      return new Promise( (resolve, reject) => {
        request
          .post(base_url)
          .send(uploadFiles)
          .end( (err, res) => resolve(res.body));
      });

    }).then( res => {
      done();
    });
  });

  describe("get /exists", () => {
    describe("正常系", () => {
      describe("重複しているファイル名を単数で指定した場合", () => {
        let payload;
        let existsFiles;

        before( done => {
          existsFiles = {
            dir_id: user.tenant.home_dir_id,
            files: [ { name: uploadFile.name }]
          };

          request
            .post(base_url + "/exists")
            .send(existsFiles)
            .end( (err, res) => {
              payload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(payload.status).equal(200);
          done();
        });

        it("successはtrue", done => {
          expect(payload.body.status.success).equal(true);
          done();
        });

        it("レスポンスは配列型", done => {
          expect(Array.isArray(payload.body.body)).equal(true);
          done();
        });

        it("配列のサイズは1つ", done => {
          expect(payload.body.body.length).equal(1);
          done();
        });

        it("配列内にはオブジェクトが格納されている", done => {
          expect(typeof _.head(payload.body.body)).equal("object");
          done();
        });

        it("オブジェクトはnameのキーが存在する", done => {
          const obj = _.head(payload.body.body);
          expect(_.has(obj, "name")).equal(true);
          done();
        });

        it("オブジェクトはis_existsのキーが存在する", done => {
          const obj = _.head(payload.body.body);
          expect(_.has(obj, "is_exists")).equal(true);
          done();
        });

        it("is_existsはtrue", done => {
          expect(_.head(payload.body.body).is_exists).equal(true);
          done();
        });

        it("nameはrequestにて指定したファイル名と同じ値", done => {
          expect(_.head(payload.body.body).name).equal(uploadFile.name);
          done();
        });
      });

      describe("重複しているファイル名としていないファイル名を複数で指定した場合", () => {
        let payload;
        let existsFiles;

        before( done => {
          existsFiles = {
            dir_id: user.tenant.home_dir_id,
            files: [
              { name: uploadFile.name },
              { name: "arienai.txt" }
            ]
          };

          request
            .post(base_url + "/exists")
            .send(existsFiles)
            .end( (err, res) => {
              payload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(payload.status).equal(200);
          done();
        });

        it("successはtrue", done => {
          expect(payload.body.status.success).equal(true);
          done();
        });

        it("レスポンスは配列型", done => {
          expect(Array.isArray(payload.body.body)).equal(true);
          done();
        });

        it("配列のサイズは2つ", done => {
          expect(payload.body.body.length).equal(2);
          done();
        });

        it("配列内にはオブジェクトが格納されている", done => {
          expect(typeof _.head(payload.body.body)).equal("object");
          done();
        });

        it("オブジェクトはnameのキーが存在する", done => {
          const hasColumns = payload.body.body.map( body => _.has(body, "name") );
          expect(hasColumns.every( n => n === true)).equal(true);
          done();
        });

        it("オブジェクトはis_existsのキーが存在する", done => {
          const hasColumns = payload.body.body.map( body => _.has(body, "is_exists") );
          expect(hasColumns.every( n => n === true)).equal(true);
          done();
        });

        it("先頭のオブジェクトのis_existsはtrue", done => {
          expect(_.head(payload.body.body).is_exists).equal(true);
          done();
        });

        it("末尾のオブジェクトのis_existsはfalse", done => {
          expect(_.last(payload.body.body).is_exists).equal(false);
          done();
        });

        it("nameはrequestにて指定したファイル名と同じ値", done => {
          expect(_.head(payload.body.body).name).equal(uploadFile.name);
          done();
        });

      });

    });
  });

});
