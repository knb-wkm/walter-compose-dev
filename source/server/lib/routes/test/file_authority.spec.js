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

  describe("post /:file_id/authorities (権限追加)", () => {
    let role_file;
    let role_user;

    before( done => {
      new Promise( (resolve, reject) => {

        request
          .get("/api/v1/role_files")
          .end( (err, res) => resolve(res) );

      }).then( res => {
        role_file = _.get(res, ["body", "body", "0"]);

        return new Promise( (resolve, reject) => {
          request
            .get("/api/v1/users")
            .end( (err, res) => resolve(res) );

        });
      }).then( res => {

        role_user = _.get(res, ["body", "body", "0"]);
        done();
      });
    });

    describe("正しいfile_id、role_file, role_userを指定した場合", () => {
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
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: role_user, role: role_file })
              .end( (err, res) => resolve(res) );
          });
        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .get(files_url + `/${file._id}`)
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

      it("指定したrole_file, userが登録されている", done => {
        const _authorities = nextPayload.body.body.authorities
              .filter( auth => auth.role_files._id === role_file._id );
        
        const _authority = _.head(_authorities);
        expect(_authority.role_files._id === role_file._id).equal(true);
        expect(_authority.users._id === role_user._id).equal(true);
        done();
      });
    });

    describe("file_idがoid形式ではない場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "ファイルIDが不正のためファイルへの権限の追加に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/invalid_oid/authorities`)
              .send({ user: role_user, role: role_file })
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

    describe("file_idが存在しないidの場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定されたファイルが存在しないためファイルへの権限の追加に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${ObjectId()}/authorities`)
              .send({ user: role_user, role: role_file })
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

    describe("role_file_idがoid形式ではない場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定された権限が存在しないためファイルへの権限の追加に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: role_user, role: "invalid_oid" })
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
        expect(payload.body.status.errors.role_file_id).equal(expected.detail);
        done();
      });
    });

    describe("role_file_idがマスタに存在しないidの場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定された権限が存在しないためファイルへの権限の追加に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: role_user, role: (new ObjectId).toString() })
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
        expect(payload.body.status.errors.role_file_id).equal(expected.detail);
        done();
      });

    });

    describe("user_idがoid形式ではない場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "ユーザIDが不正のためファイルへの権限の追加に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: "invalid_oid", role: role_file })
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
        expect(payload.body.status.errors.user_id).equal(expected.detail);
        done();
      });
    });

    describe("user_idがマスタに存在しないidの場合", () => {
      let file;
      let payload;
      let expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定されたユーザが存在しないためファイルへの権限の追加に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);
          const _role_user = { ...role_user, _id: (new ObjectId).toString() };

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: _role_user, role: role_file })
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
        expect(payload.body.status.errors.user_id).equal(expected.detail);
        done();
      });
    });

    describe("role_file_id, role_user_idが既に登録されている場合", () => {
      let file;
      let payload;
      let nextPayload;
      let expected = {
        message: "ファイルへの権限の追加に失敗しました",
        detail: "指定されたユーザ、権限は既に登録されているためファイルへの権限の追加に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: role_user, role: role_file })
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: role_user, role: role_file })
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .get(files_url + `/${file._id}`)
              .end( (err, res) => resolve(res) );
          });
        }).then( res => {
          nextPayload = res;
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
        expect(payload.body.status.errors.role_set).equal(expected.detail);
        done();
      });

      it("2重登録されていない", done => {
        const _authorities = nextPayload.body.body.authorities
              .filter( auth => auth.role_files._id = role_file._id && auth.users._id === role_user._id );

        expect(_authorities.length).equal(1);
        done();
      });

    });
  });

  describe("delete /:file_id/authorities (権限削除)", () => {
    let role_file;
    let role_user;

    before( done => {
      new Promise( (resolve, reject) => {

        request
          .get("/api/v1/role_files")
          .end( (err, res) => resolve(res) );

      }).then( res => {
        role_file = _.get(res, ["body", "body", "0"]);

        return new Promise( (resolve, reject) => {
          request
            .get("/api/v1/users")
            .end( (err, res) => resolve(res) );

        });
      }).then( res => {

        role_user = _.get(res, ["body", "body", "0"]);
        done();
      });
    });
    
    describe("正しいfile_id, role_file_id, role_user_idを指定した場合", () => {
      let file;
      let payload;
      let nextPayload;

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .post(files_url)
            .send({ ...body, name: "delete_authority_ok_test"})
            .end( (err, res) => resolve(res) );
        }).then( res => {
          file = _.get(res, ["body", "body", "0"]);

          return new Promise( (resolve, reject) => {
            request
              .post(files_url + `/${file._id}/authorities`)
              .send({ user: role_user, role: role_file })
              .end( (err, res) => resolve(res));
          });

        }).then( res => {

          return new Promise( (resolve, reject) => {
            request
              .delete(files_url + `/${file._id}/authorities`)
              .query({ user_id: role_user._id, role_id: role_file._id })
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .get(files_url + `/${file._id}`)
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

      describe("権限を削除したファイルを再度取得した場合", () => {
        it("権限は1つ(ファイル作成者のみ)", done => {
          const authority = nextPayload.body.body.authorities;
          expect(authority.length).equal(1);
          done();
        });

        it("削除したユーザが含まれていない", done => {
          const _roles = nextPayload.body.body.authorities
                .map( auth => ({ role_file_id: auth.role_files._id, user_id: auth.users._id }))
                .filter( role => role.role_file_id === role_file && role.role_user_id === role_user );

          expect(_roles.length).equal(0);
          done();
        });

      });

    });

    describe("file_idが", () => {
      describe("oid形式ではない場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイルIDが不正のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "file_id is not oid"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/invalid_oid/authorities`)
                .query({ user_id: role_user._id, role_id: role_file._id })
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
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "指定されたファイルが存在しないためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "file_id is not found"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${(new ObjectId).toString()}/authorities`)
                .query({ user_id: role_user._id, role_id: role_file._id })
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

    describe("role_file_idが", () => {
      describe("undefinedの場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが空のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_file_id is undefined"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: role_user._id, role: undefined })
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
          expect(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが空のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_file_id is null"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: role_user._id, role: null })
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
          expect(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが空のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_file_id is undefined"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: role_user._id, role: "" })
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
          expect(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("oid形式ではない場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ファイル権限IDが不正のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_file_id is invalid oid"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: role_user._id, role_id: "invalid_oid" })
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
          expect(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe("存在しないidの場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "指定されたファイル権限が存在しないためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_file_id is not found"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: role_user._id, role_id: (new ObjectId).toString() })
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
          expect(payload.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });
    });

    describe("role_user_idが", () => {
      describe("undefinedの場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが空のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_user_id is undefined"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: undefined, role_id: role_file._id })
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが空のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_user_id is null"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: null, role_id: role_file._id })
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが空のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_user_id is undefined"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: "", role_id: role_file._id })
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      describe("oid形式ではない場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "ユーザIDが不正のためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_user_id is invalid"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: "invalid_oid", role_id: role_file._id })
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });

      });

      describe("存在しないidの場合", () => {
        let file;
        let payload;
        let nextPayload;
        let expected = {
          message: "ファイルへの権限の削除に失敗しました",
          detail: "指定されたユーザが存在しないためファイルへの権限の削除に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send({ ...body, name: "role_user_id is not found"})
              .end( (err, res) => resolve(res) );
          }).then( res => {
            file = _.get(res, ["body", "body", "0"]);

            return new Promise( (resolve, reject) => {
              request
                .post(files_url + `/${file._id}/authorities`)
                .send({ user: role_user, role: role_file })
                .end( (err, res) => resolve(res));
            });

          }).then( res => {

            return new Promise( (resolve, reject) => {
              request
                .delete(files_url + `/${file._id}/authorities`)
                .query({ user_id: (new ObjectId).toString(), role_id: role_file._id })
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });

      });
    });


  });

});
