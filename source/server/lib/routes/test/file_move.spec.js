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

describe("patch " + files_url + "/:file_id/move", () => {
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

  describe("正しいfile_id, dir_idを指定した場合", () => {
    let payload;
    let createdFile;

    before( done => {
      new Promise( (resolve, reject) => {
        request
          .post(files_url)
          .send(body)
          .end( (err, res) => resolve(res) );
      }).then( res => {
        createdFile = _.get(res, ["body", "body", "0"]);

        return new Promise( (resolve, reject) => {
          request
            .patch(files_url + `/${createdFile._id}/move`)
            .send({ dir_id: user.tenant.trash_dir_id })
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

    it("返却された値は移動後のdir_idとなっている", done => {
      expect(payload.body.body.dir_id).equal(user.tenant.trash_dir_id);
      done();
    });
  });

  describe("file_idが", () => {
    describe("oid形式ではない場合", () => {
      let payload;
      let createdFile;
      let expected = {
        message: "ファイルの移動に失敗しました",
        detail: "ファイルIDが不正のためファイルの移動に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/invalid_oid/move`)
              .send({ dir_id: user.tenant.trash_dir_id })
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

    describe("存在しないidの場合", () => {
      let payload;
      let createdFile;
      let expected = {
        message: "ファイルの移動に失敗しました",
        detail: "指定されたファイルが存在しないためファイルの移動に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${user._id}/move`)
              .send({ dir_id: user.tenant.trash_dir_id })
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
  });

  describe("dir_idが", () => {
    describe("undefinedの場合", () => {
      let payload;
      let createdFile;
      let expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが空のためファイルの移動に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${createdFile._id}/move`)
              .send()
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
        expect(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("nullの場合", () => {
      let payload;
      let createdFile;
      let expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが空のためファイルの移動に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${createdFile._id}/move`)
              .send({ dir_id: null })
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
        expect(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("空文字の場合", () => {
      let payload;
      let createdFile;
      let expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが空のためファイルの移動に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${createdFile._id}/move`)
              .send({ dir_id: "" })
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
        expect(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("oid形式ではない場合", () => {
      let payload;
      let createdFile;
      let expected = {
        message: "ファイルの移動に失敗しました",
        detail: "フォルダIDが不正のためファイルの移動に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${createdFile._id}/move`)
              .send({ dir_id: "invalid_oid" })
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
        expect(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

    describe("存在しないidの場合", () => {
      let payload;
      let createdFile;
      let expected = {
        message: "ファイルの移動に失敗しました",
        detail: "指定されたフォルダが存在しないためファイルの移動に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          createdFile = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .patch(files_url + `/${createdFile._id}/move`)
              .send({ dir_id: user._id })
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
        expect(payload.body.status.errors.dir_id).equal(expected.detail);
        done();
      });
    });

  });

});
