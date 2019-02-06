import util from "util";
import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import * as _ from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";
import * as helper from "./helper";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use("/", Router);

const { ObjectId } = mongoose.Types;

const files_url = "/api/v1/files";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;

describe(files_url + "/search_items", () => {

  before( done => {
    initdbPromise.then( () => {
      new Promise( (resolve, reject) => {
        request.post(login_url)
          .send(authData)
          .end( (err, res) => {
            request.set("x-auth-cloud-storage", res.body.body.token);
            resolve(res);
          });
      }).then( res => {
        const user_id = res.body.body.user._id;
        done();
      });
    });
  });

  describe("queryなしで取得した場合", () => {
    let payload;

    before( done => {
      request
        .get(files_url + "/search_items")
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(200)が返却される", done => {
      expect(payload.status).equal(200);
      done();
    });

    it("返却されるオブジェクトは1以上の配列", done => {
      expect(payload.body.body.length > 0).equal(true);
      done();
    });

    it("返却されるオブジェクトは「_id, tenant_id, label, name, meta_info_id」を含む", done => {
      const needle = ["_id", "tenant_id", "label", "name", "meta_info_id"];

      const columns = payload.body.body
            .map( obj => _.intersection(_.keys(obj), needle) )
            .map( keys => keys.length === needle.length );

      expect(columns.every( col => col === true )).equal(true);
      done();
    });
  });

  describe("queryにmeta_only=trueを指定した場合", () => {
    let payload;

    before( done => {
      request
        .get(files_url + "/search_items")
        .query({ meta_only: true })
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(200)が返却される", done => {
      expect(payload.status).equal(200);
      done();
    });

    it("返却されるオブジェクトは1以上の配列", done => {
      expect(payload.body.body.length > 0).equal(true);
      done();
    });

    it("返却されるオブジェクトは「_id, tenant_id, label, name, value_type」を含む", done => {
      const needle = ["_id", "tenant_id", "label", "name", "value_type"];

      const columns = payload.body.body
            .map( obj => _.intersection(_.keys(obj), needle) )
            .map( keys => keys.length === needle.length );

      expect(columns.every( col => col === true )).equal(true);
      done();
    });
  });

  describe("queryにmeta_only=bool以外の値を指定した場合", () => {
    let payload;

    let expected = {
      message: "検索項目の取得に失敗しました",
      detail: "指定したオプションが真偽値以外のため検索項目の取得に失敗しました"
    };

    before( done => {
      request
        .get(files_url + "/search_items")
        .query({ meta_only: "invalid_params" })
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(400)が返却される", done => {
      expect(payload.status).equal(400);
      done();
    });

    it(`エラーの概要は「${expected.message}」`, done => {
      expect(payload.body.status.message).equal(expected.message);
      done();
    });

    it(`エラーの詳細は「${expected.detail}」`, done => {
      expect(payload.body.status.errors.meta_only).equal(expected.detail);
      done();
    });
  });
});
