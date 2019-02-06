import util from "util";
import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { intersection, uniq, head, last, includes, has, pick, keys, values, chain, range, map, filter } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use("/", Router);

const user_url = "/api/v1/users";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;

// ユーザ詳細
describe(user_url + "/:user_id", () => {
  before( done => {
    initdbPromise.then( () => {
      request.post(login_url)
        .send(authData)
        .end( (err, res) => {
          request.set("x-auth-cloud-storage", res.body.body.token);
          user = res.body.body.user;
          done();
        });
    });
  });

  describe("get /", () => {
    describe("ログインユーザのuser_idを指定した場合", () => {
      let payload;

      before( done => {
        request
          .get(user_url + `/${user._id}`)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("1個のオブジェクトが返却される", done => {
        expect(typeof payload.body.body === "object").equal(true);
        done();
      });

      describe("userオブジェクトの型", () => {
        it("_id, name, account_name, email, tenant_idが含まれている", done => {
          const needle = ["_id", "name", "account_name", "email", "tenant_id"];
          expect(
            chain(payload.body.body).pick(needle).keys().value().length === needle.length
          ).equal(true);

          done();
        });

        it("groupsが含まれている", done => {
          const needle = ["groups"];
          expect(
            chain(payload.body.body).pick(needle).keys().value().length === needle.length
          ).equal(true);
          done();
        });

        it("groups[0]に_id, name, description, tenant_idが含まれている", done => {
          const needle = ["_id", "name", "description", "tenant_id"];
          const columns = chain(payload.body.body.groups).head().pick(needle).keys().value();
          expect(columns.length === needle.length).equal(true);
          done();
        });

        it("groups[0].tenantにはname, role_files, tenant_id, rolesが含まれている", done => {
          const needle = ["name", "role_files", "tenant_id", "roles"];
          const tenant = chain(payload.body.body.groups).head().value();
          const columns = chain(tenant).pick(needle).keys().value();
          expect(columns.length === needle.length).equal(true);
          done();
        });
      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let expected = {
          message: "ユーザの取得に失敗しました",
          detail: "ユーザIDが不正のためユーザの取得に失敗しました"
        };

        before( done => {
          request
            .get(user_url + "/undefined_oid")
            .end( (err, res) => {
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });

      });
    });
  });

  // 所属グループの追加
  describe("post /:user_id/groups", () => {
    describe("user_id, group_idを正しく指定した場合", () => {
      let payload;
      let group_id;
      let changedUser;

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .get("/api/v1/groups")
            .end( (err, res) => {
              if (err) reject(err);
              resolve(res);
            });
        }).then( res => {
          group_id = res.body.body[1]._id;

          return new Promise( (resolve, reject) => {
            request
              .post(user_url + `/${user._id}/groups`)
              .send({ group_id })
              .end( (err, res) => {
                if (err) reject(err);
                resolve(res);
              });
          });
        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
            .get(user_url + `/${user._id}`)
            .end( (err, res) => {
              if (err) reject(err);
              resolve(res);
            });
          });
        }).then( res => {
          changedUser = res;
          done();
        });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("変更したユーザを取得した場合、追加したグループを含めた結果が返却される", done => {
        const group_ids = changedUser.body.body.groups
              .map( group => group._id )
              .filter( id => id === group_id );

        expect(group_ids.length === 1).equal(true);
        done();
      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let group_id;
        let expected = {
          message: "グループの追加に失敗しました",
          detail: "ユーザIDが不正のためグループの追加に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .get("/api/v1/groups")
              .end( (err, res) => {
                resolve(res);
              });
          }).then( res => {
            group_id = head(res.body.body)._id;

            return new Promise ( (resolve, reject) => {
              request
                .post(user_url + "/invalid_oid/groups")
                .send({ group_id })
                .end( (err, res) => {
                  resolve(res);
                });
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });

    describe("指定されたgroup_idが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが空のためグループの追加に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(user_url + `/${user._id}/groups`)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let group_id = null;
        let expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが空のためグループの追加に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(user_url + `/${user._id}/groups`)
              .send({ group_id })
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let group_id = "";
        let expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが空のためグループの追加に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(user_url + `/${user._id}/groups`)
              .send({ group_id })
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("存在しないoidの場合", () => {
        let payload;
        let group_id = "invalid_oid";
        let expected = {
          message: "グループの追加に失敗しました",
          detail: "グループIDが不正のためグループの追加に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(user_url + `/${user._id}/groups`)
              .send({ group_id })
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("重複している場合", () => {
        let payload;

        let expected = {
          message: "グループの追加に失敗しました",
          detail: "指定されたユーザは既に指定したグループに所属しているためグループの追加に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(user_url + `/${user._id}/groups`)
              .send({ group_id: head(user.groups) })
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });
    });

  });

  // パスワード変更(ユーザ向け)
  describe("patch /:user_id/password", () => {

    // 変更したパスワードを元に戻す
    afterEach( done => {
      new Promise( (resolve, reject) => {
        request
          .patch(user_url + `/${user._id}/password_force`)
          .send({ password: authData.password })
          .end( (err, res) => resolve(res) );
      }).then( res => {
        done();
      });
    });

    describe("ログインユーザのuser_id、正しいパスワードを指定した場合", () => {
      let payload;
      let afterPayload;
      let body = {
        current_password: authData.password,
        new_password: authData.password + authData.password
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${user._id}/password`)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .post(login_url)
              .send({
                account_name: authData.account_name,
                password: body.new_password
              })
              .end( (err, res) => resolve(res) );
          });
        }).then( res => {
          afterPayload = res;
          done();
        });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("変更したパスワードでログインした場合", () => {
        it("http(200)が返却される", done => {
          expect(afterPayload.status).equal(200);
          done();
        });

        it("tokenが返却される", done => {
          expect(afterPayload.body.body.token.length > 0).equal(true);
          done();
        });

        it("userオジェクトが返却される", done => {
          expect(afterPayload.body.body.user._id.length > 0).equal(true);
          done();
        });
      });
    });

    describe("current_passwordが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let body = {
          new_password: authData.password + authData.password
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "現在のパスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let body = {
          current_password: null,
          new_password: authData.password + authData.password
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "現在のパスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let body = {
          current_password: "",
          new_password: authData.password + authData.password
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "現在のパスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      describe("現在のパスワードと一致しない場合", () => {
        let payload;
        let body = {
          current_password: authData.password + authData.password,
          new_password: authData.password + authData.password
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "変更前のパスワードが一致しないため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });
    });

    describe("new_passwordが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let body = {
          current_password: authData.password
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.new_password).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let body = {
          current_password: authData.password,
          new_password: null
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.new_password).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let body = {
          current_password: authData.password,
          new_password: ""
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.new_password).equal(expected.detail);
          done();
        });
      });

      // パスワードは文字数制限の対象外
      describe.skip("255文字以上の場合", () => {
        let payload;
        let body = {
          current_password: authData.password,
          new_password: range(256).join("")
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが長すぎます"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.current_password).equal(expected.detail);
          done();
        });
      });

      // パスワードは禁止文字の対象外
      describe.skip("禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        describe("バックスラッシュ", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo\\foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo/foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });

        describe("コロン", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo:foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });
        describe("アスタリスク", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo*foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });

        });

        describe("クエスション", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo?foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });

        });

        describe("山括弧開く", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo<foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });

        });

        describe("山括弧閉じる", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo>foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });

        });

        describe("パイプ", () => {
          let payload;
          let body = {
            current_password: authData.password,
            new_password: "foo|foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.current_password).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("user_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let body = {
          current_password: authData.password,
          new_password: "foobar"
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "ユーザIDが不正のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + "/invalid_oid/password")
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });
  });

  // パスワード変更(管理者向け)
  describe("patch /:user_id/password_force", () => {

    // 変更したパスワードを元に戻す
    afterEach( done => {
      new Promise( (resolve, reject) => {
        request
          .patch(user_url + `/${user._id}/password_force`)
          .send({ password: authData.password })
          .end( (err, res) => resolve(res) );
      }).then( res => {
        done();
      });
    });

    describe("ログインユーザのuser_id、正しいパスワードを指定した場合", () => {
      let payload;
      let body = {
        password: "foobar"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${user._id}/password_force`)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          payload = res;
          done();
        });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("変更したパスワードでログインした場合", () => {
        let payload;

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .post(login_url)
              .send({
                account_name: authData.account_name,
                password: authData.password
              })
              .end( (err, res) => resolve(res) );
          }).then( res => {
            payload = res;
            done();
          });
        });

        it("変更したパスワードでログインすることが可能", done => {
          expect(payload.status).equal(200);
          done();
        });

        it("tokenが返却される", done => {
          expect(payload.body.body.token.length > 0).equal(true);
          done();
        });

        it("ユーザオブジェクトが返却される", done => {
          expect(payload.body.body.user._id.length > 0).equal(true);
          done();
        });
      });
    });

    describe("user_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let body = {
          password: "foobar"
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "ユーザIDが不正のためパスワードの変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/invalid_oid/password_force`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });
    });

    describe("passwordが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let body = {
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "パスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password_force`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let body = {
          password: null
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "パスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password_force`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let body = {
          password: ""
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "パスワードが空のため変更に失敗しました"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password_force`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.password).equal(expected.detail);
          done();
        });
      });

      // パスワードは文字数制限の対象外
      describe.skip("255文字以上の場合", () => {
        let payload;
        let body = {
          password: range(256).join("")
        };

        let expected = {
          message: "パスワードの変更に失敗しました",
          detail: "新しいパスワードが長すぎます"
        };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/password_force`)
              .send(body)
              .end( (err, res) => resolve(res) );
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
          expect(payload.body.status.errors.user_id).equal(expected.detail);
          done();
        });
      });

      // パスワードは禁止文字制限の対象外
      describe.skip("禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        describe("バックスラッシュ", () => {
          let payload;
          let body = {
            password: "foo\\foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", () => {
          let payload;
          let body = {
            password: "foo/foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });

        });

        describe("コロン", () => {
          let payload;
          let body = {
            password: "foo:foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });

        });

        describe("アスタリスク", () => {
          let payload;
          let body = {
            password: "foo*foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });

        });

        describe("クエスション", () => {
          let payload;
          let body = {
            password: "foo?foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", () => {
          let payload;
          let body = {
            password: "foo<foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", () => {
          let payload;
          let body = {
            password: "foo>foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });

        });

        describe("パイプ", () => {
          let payload;
          let body = {
            password: "foo|foo"
          };

          let expected = {
            message: "パスワードの変更に失敗しました",
            detail: "新しいパスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            new Promise( (resolve, reject) => {
              request
                .patch(user_url + `/${user._id}/password_force`)
                .send(body)
                .end( (err, res) => resolve(res) );
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
            expect(payload.body.status.errors.user_id).equal(expected.detail);
            done();
          });

        });

      });
    });
  });
});
