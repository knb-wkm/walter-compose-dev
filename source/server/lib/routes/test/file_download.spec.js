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

describe(files_url, () => {

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

        return new Promise( (resolve, reject) => {
          request
            .get(`/api/v1/users/${user_id}`)
            .end( (err, res) => resolve(res));
        });
      }).then( res => {
        user = res.body.body;

        const body = {
          files: [
            {
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }
          ]
        };

        return new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => {
              resolve(res);
            });
        });

      }).then( res => done() );
    });
  });

  describe("存在するファイルidを指定した場合", () => {
    let payload;
    let file;

    before( done => {
      request
        .get(files_url)
        .end( (err, res) => {
          payload = res;
          file = _.get(payload, ["body", "body", "0"]);

          request
            .get(files_url + "/download")
            .query({ file_id: file._id })
            .buffer()
            .parse(helper.binaryParser)
            .end( (err, res) => {
              payload = res;
              done();
            });
        });
    });

    it("http(200)が返却される", done => {
      expect(payload.status).equal(200);
      done();
    });

    it("ダウンロードしたファイルはバッファ型", done => {
      expect(Buffer.isBuffer(payload.body)).equal(true);
      done();
    });

    it("バッファを文字列にキャストした場合、空ではない", done => {
      expect(payload.body.toString().length > 0).equal(true);
      done();
    });
  });

  describe("ファイルidがundefinedの場合", () => {
    let payload;
    let file;
    let expected = {
      message: "ファイルのダウンロードに失敗しました",
      detail: "ファイルIDが空のためファイルのダウンロードに失敗しました"
    };

    before( done => {
      request
        .get(files_url + "/download")
        .buffer()
        .parse(helper.binaryParser)
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(400)が返却される", done => {
      expect(payload.status).equal(400);
      done();
    });

    it("successはfalse", done => {
      expect(JSON.parse(payload.body.toString()).status.success).equal(false);
      done();
    });

    it(`エラーの概要は「${expected.message}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.message).equal(expected.message);
      done();
    });

    it(`エラーの詳細は「${expected.detail}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.errors.file_id).equal(expected.detail);
      done();
    });
  });

  describe("ファイルidがnullの場合", () => {
    let payload;
    let file;
    let expected = {
      message: "ファイルのダウンロードに失敗しました",
      detail: "ファイルIDが空のためファイルのダウンロードに失敗しました"
    };

    before( done => {
      request
        .get(files_url + "/download")
        .query({ file_id: null })
        .buffer()
        .parse(helper.binaryParser)
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(400)が返却される", done => {
      expect(payload.status).equal(400);
      done();
    });

    it("successはfalse", done => {
      expect(JSON.parse(payload.body.toString()).status.success).equal(false);
      done();
    });

    it(`エラーの概要は「${expected.message}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.message).equal(expected.message);
      done();
    });

    it(`エラーの詳細は「${expected.detail}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.errors.file_id).equal(expected.detail);
      done();
    });
  });

  describe("ファイルidが空文字の場合", () => {
    let payload;
    let file;
    let expected = {
      message: "ファイルのダウンロードに失敗しました",
      detail: "ファイルIDが空のためファイルのダウンロードに失敗しました"
    };

    before( done => {
      request
        .get(files_url + "/download")
        .query({ file_id: "" })
        .buffer()
        .parse(helper.binaryParser)
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(400)が返却される", done => {
      expect(payload.status).equal(400);
      done();
    });

    it("successはfalse", done => {
      expect(JSON.parse(payload.body.toString()).status.success).equal(false);
      done();
    });

    it(`エラーの概要は「${expected.message}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.message).equal(expected.message);
      done();
    });

    it(`エラーの詳細は「${expected.detail}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.errors.file_id).equal(expected.detail);
      done();
    });
  });

  describe("ファイルidがoid形式ではない場合", () => {
    let payload;
    let file;
    let expected = {
      message: "ファイルのダウンロードに失敗しました",
      detail: "ファイルIDが不正のためファイルのダウンロードに失敗しました"
    };

    before( done => {
      request
        .get(files_url + "/download")
        .query({ file_id: "invalid_oid" })
        .buffer()
        .parse(helper.binaryParser)
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(400)が返却される", done => {
      expect(payload.status).equal(400);
      done();
    });

    it("successはfalse", done => {
      expect(JSON.parse(payload.body.toString()).status.success).equal(false);
      done();
    });

    it(`エラーの概要は「${expected.message}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.message).equal(expected.message);
      done();
    });

    it(`エラーの詳細は「${expected.detail}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.errors.file_id).equal(expected.detail);
      done();
    });
  });

  describe("ファイルidが存在しないoidの場合", () => {
    let payload;
    let file;
    let expected = {
      message: "ファイルのダウンロードに失敗しました",
      detail: "指定されたファイルが存在しないためファイルのダウンロードに失敗しました"
    };

    before( done => {
      request
        .get(files_url + "/download")
        .query({ file_id: (new ObjectId).id.toString() })
        .buffer()
        .parse(helper.binaryParser)
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(400)が返却される", done => {
      expect(payload.status).equal(400);
      done();
    });

    it("successはfalse", done => {
      expect(JSON.parse(payload.body.toString()).status.success).equal(false);
      done();
    });

    it(`エラーの概要は「${expected.message}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.message).equal(expected.message);
      done();
    });

    it(`エラーの詳細は「${expected.detail}」`, done => {
      expect(JSON.parse(payload.body.toString()).status.errors.file_id).equal(expected.detail);
      done();
    });
  });
});
