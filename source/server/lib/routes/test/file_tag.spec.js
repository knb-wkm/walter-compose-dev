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

  describe("タグ追加(post /:file_id/tags)", () => {
    let tag;

    before( done => {
      request
        .get("/api/v1/tags")
        .end( (err, res) => {
          tag = _.get(res, ["body", "body", "0"]);
          done();
        });
    });

    describe("正しいファイルid, タグidを指定した場合", () => {
      let createdFile;
      let payload;

      before( done => {
        request
          .post(files_url)
          .send(body)
          .end( (err, res) => {
            createdFile = _.get(res, ["body", "body", "0"]);

            request
              .post(files_url + `/${createdFile._id}/tags`)
              .send(tag)
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

      it("返却されるオブジェクトに追加したタグidが含まれている", done => {
        const matched = _.get(payload, ["body", "body", "tags"])
              .filter( _tag => _tag._id === tag._id );

        expect(matched.length === 1).equal(true);
        done();
      });
    });

    describe("ファイルidがoid形式ではない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの追加に失敗しました",
        detail: "ファイルIDが不正のためタグの追加に失敗しました"
      };

      before( done => {
        request
          .post(files_url)
          .send(body)
          .end( (err, res) => {
            createdFile = _.get(res, ["body", "body", "0"]);

            request
              .post(files_url + `/invalid_oid/tags`)
              .send(tag)
              .end( (err, res) => {
                payload = res;
                done();
              });
          });
      });

      it("http(400)が返却される", done => {
        expect(payload.status).equal(400);
        done();
      });

      it("successはfalse", done => {
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

    describe("ファイルidが存在しない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの追加に失敗しました",
        detail: "指定されたファイルが存在しないためタグの追加に失敗しました"
      };

      before( done => {
        request
          .post(files_url)
          .send(body)
          .end( (err, res) => {
            createdFile = _.get(res, ["body", "body", "0"]);

            request
              .post(files_url + `/${ObjectId()}/tags`)
              .send(tag)
              .end( (err, res) => {
                payload = res;
                done();
              });
          });
      });

      it("http(400)が返却される", done => {
        expect(payload.status).equal(400);
        done();
      });

      it("successはfalse", done => {
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

    describe("タグidがoid形式ではない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの追加に失敗しました",
        detail: "タグIDが不正のためタグの追加に失敗しました"
      };

      before( done => {
        request
          .post(files_url)
          .send(body)
          .end( (err, res) => {
            createdFile = _.get(res, ["body", "body", "0"]);

            request
              .post(files_url + `/${createdFile._id}/tags`)
              .send({ ...tag, _id: "invalid_id" })
              .end( (err, res) => {
                payload = res;
                done();
              });
          });
      });

      it("http(400)が返却される", done => {
        expect(payload.status).equal(400);
        done();
      });

      it("successはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });

    describe("タグidが存在しない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの追加に失敗しました",
        detail: "指定されたタグが存在しないためタグの追加に失敗しました"
      };

      before( done => {
        request
          .post(files_url)
          .send(body)
          .end( (err, res) => {
            createdFile = _.get(res, ["body", "body", "0"]);

            request
              .post(files_url + `/${createdFile._id}/tags`)
              .send({ ...tag, _id: ObjectId() })
              .end( (err, res) => {
                payload = res;
                done();
              });
          });
      });

      it("http(400)が返却される", done => {
        expect(payload.status).equal(400);
        done();
      });

      it("successはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });
  });

  describe("タグ削除(delete /:file_id/tags/:tag_id)", () => {
    let tag;

    before( done => {
      request
        .get("/api/v1/tags")
        .end( (err, res) => {
          tag = _.get(res, ["body", "body", "0"]);
          done();
        });
    });

    describe("正しいファイルid, タグidを指定した場合", () => {
      let createdFile;
      let payload;

      before( done => {
        const _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(_body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .delete(files_url + `/${createdFile._id}/tags/${tag._id}`)
              .end( (err, res) => resolve(res) );
          });
        }).then( res => {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("返却されるオブジェクトに追加したタグidが含まれていない", done => {
        const matched = _.get(payload, ["body", "body", "tags"])
              .filter( _tag => _tag._id === tag._id );

        expect(matched.length === 0).equal(true);
        done();
      });
    });

    describe("ファイルidがoid形式ではない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの削除に失敗しました",
        detail: "ファイルIDが不正のためタグの削除に失敗しました"
      };

      before( done => {
        const _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(_body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .delete(files_url + `/invalid_id/tags/${tag._id}`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });

    describe("ファイルidが存在しない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの削除に失敗しました",
        detail: "指定されたファイルが存在しないためタグの削除に失敗しました"
      };

      before( done => {
        const _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(_body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .delete(files_url + `/${ObjectId()}/tags/${tag._id}`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.file_id).equal(expected.detail);
        done();
      });
    });

    describe("タグidがoid形式ではない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの削除に失敗しました",
        detail: "タグIDが不正のためタグの削除に失敗しました"
      };

      before( done => {
        const _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(_body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .delete(files_url + `/${createdFile._id}/tags/invalid_id`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });

    describe("タグidが存在しない場合", () => {
      let createdFile;
      let payload;
      let expected = {
        message: "タグの削除に失敗しました",
        detail: "指定されたタグが存在しないためタグの削除に失敗しました"
      };

      before( done => {
        const _body = _.clone(body);
        _body.files[0].tags = [tag._id];

        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(_body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .delete(files_url + `/${createdFile._id}/tags/${ObjectId()}`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.tag_id).equal(expected.detail);
        done();
      });
    });
  });
});

