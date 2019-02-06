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

describe(files_url, () => {
  let user;
  let body = {
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
        user = res.body.body.user;
        done();
      });
    });
  });

  describe("patch /:file_id/toggle_star", () => {
    describe("正しいfile_idを指定した場合", () => {
      let file;
      let payload;
      let nextPayload;
      
      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          file = _.head(res.body.body);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${file._id}/toggle_star`)
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${file._id}/toggle_star`)
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          nextPayload = res;
          done();
        });
      });
      
      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("作成時、is_starはfalseになっている", done => {
        expect(file.is_star).equal(false);
        done();
      });

      it("トグル実行後、is_starはfalse -> trueになっている", done => {
        expect(payload.body.body.is_star).equal(true);
        done();
      });

      it("再度トグル実行後、is_starはtrue -> falseになっている", done => {
        expect(nextPayload.body.body.is_star).equal(false);
        done();
      });
    });

    describe("file_idがoid形式ではない場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルのお気に入りの設定に失敗しました",
        detail: "ファイルIDが不正のためファイルのお気に入りの設定に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          file = _.head(res.body.body);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/invalid_oid/toggle_star`)
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          payload = res;
          done();
        });
      });

      it("http(400)が返却される", done => {
        expect(payload.status).equal(400);
        done();
      });

      it("statusはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });

    describe("file_idが存在しないidの場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルのお気に入りの設定に失敗しました",
        detail: "指定されたファイルが存在しないためファイルのお気に入りの設定に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          file = _.head(res.body.body);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${ObjectId()}/toggle_star`)
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          payload = res;
          done();
        });
      });

      it("http(400)が返却される", done => {
        expect(payload.status).equal(400);
        done();
      });

      it("statusはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });
  });
});
