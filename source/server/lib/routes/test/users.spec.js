import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import {
  intersection,
  uniq,
  head,
  last,
  includes,
  has,
  pick,
  keys,
  values,
  chain,
  range
} from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use("/", Router);

const users_url = "/api/v1/users";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;

describe(users_url, () => {
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

  // ユーザ一覧
  describe("get /", () => {
    describe("queryを省略した場合", () => {
      let payload;

      before( done => {
        request
          .get(users_url)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("0個以上のオブジェクトが返却される", done => {
        expect(payload.body.body.length > 0).equal(true);
        done();
      });

      describe("userオブジェクトの型", () => {
        let payload;

        before( done => {
          request
            .get(users_url)
            .end( (err, res) => {
              payload = res.body.body;
              done();
            });
        });

        it("_id, name, account_name, email, tenant_idが含まれている", done => {
          const needle = ["_id", "name", "account_name", "email", "tenant_id"];
          const columns = payload.map( obj => (
            chain(obj).pick(needle).keys().value().length === needle.length
          ));

          expect(columns.every( col => col === true )).equal(true);
          done();
        });

        it("groupsが含まれている", done => {
          const needle = ["groups"];
          const columns = payload.map( obj => (
            chain(obj).pick(needle).keys().value().length === needle.length
          ));

          expect(columns.every( col => col === true )).equal(true);
          done();
        });

        it("groups[0]に_id, name, description, tenant_idが含まれている", done => {
          const groups = chain(payload).head().value().groups;
          const needle = ["_id", "name", "description", "tenant_id"];
          const intersec = chain(groups).head().pick(needle).keys().value();
          expect(intersec.length === needle.length).equal(true);
          done();
        });
      });

    });

    describe("queryにキーワードを指定した場合", () => {
      let payload;
      let query = { q: "hanako" };

      before( done => {
        request
          .get(users_url)
          .query(query)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("0個以上のオブジェクトが返却される", done => {
        expect(payload.body.body.length > 0).equal(true);
        done();
      });

      it("指定したキーワードを含んだ(name, account_nameカラム)結果が返却される", done => {
        const results = payload.body.body.map( obj => (
          includes(obj.name, query.q) || includes(obj.account_name, query.q)
        ));
        expect(results.every( r => r === true)).equal(true);
        done();
      });

      describe("userオブジェクトの型", () => {
        it("_id, name, account_name, email, tenant_idが含まれている", done => {
          const needle = ["_id", "name", "account_name", "email", "tenant_id"];
          const columns = payload.body.body.map( obj => (
            chain(obj).pick(needle).keys().value().length === needle.length
          ));
          expect(columns.every( col => col === true )).equal(true);
          done();
        });

        it("groupsが含まれている", done => {
          const needle = ["groups"];
          const columns = payload.body.body.map( obj => (
            chain(obj).pick(needle).keys().value().length === needle.length
          ));
          expect(columns.every ( col => col === true )).equal(true);
          done();
        });

        it("groups[0]に_id, name, tenant_idが含まれている", done => {
          const needle = ["_id", "name", "tenant_id"];
          expect(chain(payload.body.body).head().pick(needle).keys().value().length)
            .equal(needle.length);
          done();
        });

      });
    });

  });

  // ユーザ作成
  describe("post /", () => {
    describe("account_name, name, email, passwordを正しく指定した場合", () => {
      let payload;
      let user = {
        account_name: "jiro",
        name: "jiro",
        email: "example@localhost",
        password: "test",
        role_id: null
      };

      before( done => {
        request
          .get("/api/v1/role_menus")
          .end( (err, res) => {
            user.role_id = head(res.body.body)._id;

            request
              .post(users_url)
              .send({ user })
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

      it("作成したユーザの各カラムは0文字以上", done => {
        const needle = ["account_name", "name", "email", "role_id", "password"];
        const values = chain(payload.body.body).pick(needle).values().value();
        expect(values.every( p => p.length > 0 )).equal(true);
        done();
      });

      describe("作成したユーザでログインした場合", done => {
        let loginPayload;

        before( done => {
          request
            .post("/api/login")
            .send({ account_name: user.account_name, password: user.password })
            .end( (err, res) => {
              loginPayload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(loginPayload.status).equal(200);
          done();
        });

        it("100文字以上のtokenが返却される", done => {
          expect(loginPayload.body.body.token.length > 100).equal(true);
          done();
        });

      });
    });

    describe("account_nameが", () => {
      let expected = {
        message: "ユーザの作成に失敗しました",
        detail: "アカウント名が空のためユーザの作成に失敗しました"
      };

      describe("undefinedの場合", () => {

        let payload;
        let user = {
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let user = {
          account_name: null,
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let user = {
          account_name: "",
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });

      });

      describe("重複する場合", () => {
        let payload;
        let user = {
          account_name: authData.account_name,
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "既に同アカウント名のユーザが存在するためユーザの作成に失敗しました"
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("255文字以上の場合", () => {
        let payload;

        let user = {
          account_name: range(256).join(""),
          name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "アカウント名が制限文字数(255)を超過したためユーザの作成に失敗しました"
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "アカウント名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        describe("バックスラッシュ", () => {
          let payload;
          let user = {
            account_name: "\a\b\c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", () => {
          let payload;
          let user = {
            account_name: "a/b/c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("コロン", () => {
          let payload;
          let user = {
            account_name: "a:b:c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("アスタリスク", () => {
          let payload;
          let user = {
            account_name: "a*b*c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", () => {
          let payload;
          let user = {
            account_name: "a?b?c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", () => {
          let payload;
          let user = {
            account_name: "a<b<c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", () => {
          let payload;
          let user = {
            account_name: "a>b>c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", () => {
          let payload;
          let user = {
            account_name: "a|b|c",
            name: "jiro",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;
                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

      });
    });

    describe("nameが", () => {
      describe("undefinedの場合", () => {
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が空のためユーザの作成に失敗しました"
        };

        let payload;
        let user = {
          account_name: "jiro",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });

      });

      describe("nullの場合", () => {
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が空のためユーザの作成に失敗しました"
        };

        let payload;
        let user = {
          account_name: "jiro",
          name: null,
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が空のためユーザの作成に失敗しました"
        };

        let payload;
        let user = {
          account_name: "jiro",
          name: "",
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      // 重複禁止はaccount_nameのみ
      describe.skip("重複する場合", () => {
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "その表示名は既に使用されています"
        };

        let payload;
        let user = {
          account_name: "jiro",
          name: authData.name,
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
                .end( (err, res) => {

                  request
                    .post(users_url)
                    .send({ user })
                    .end( (err, res) => {
                      payload = res;
                      done();
                    });

                });
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
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });

      });

      describe("255文字以上の場合", () => {
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "表示名が制限文字数(255)を超過したためユーザの作成に失敗しました"
        };

        let payload;
        let user = {
          account_name: "jiro",
          name: range(256).join(""),
          email: "example@localhost",
          password: "test",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });

      });

      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        describe("バックスラッシュ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j\\i\\r\\o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
        describe("スラッシュ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j/i/r/o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
        describe("コロン", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j:i:r:o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
        describe("アスタリスク", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j*i*r*o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j?i?r?o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j<i<r<o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });

        });

        describe("山括弧閉じる", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j>i>r>o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });

        });

        describe("パイプ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "j|i|r|o",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
      });
    });

    describe("emailが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let user = {
          account_name: "jiro",
          name: "jiro",
          password: "test",
          role_id: null
        };

        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが空のためユーザの作成に失敗しました"
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let user = {
          account_name: "jiro",
          name: "jiro",
          password: "test",
          role_id: null
        };

        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが空のためユーザの作成に失敗しました"
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });

      });

      describe("空文字の場合", () => {
        let payload;
        let user = {
          account_name: "jiro",
          email: "",
          name: "jiro",
          password: "test",
          role_id: null
        };

        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが空のためユーザの作成に失敗しました"
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });

      });

      describe("重複する場合", () => {
        let payload;
        let user = {
          account_name: "email duplicate",
          name: "email duplicate",
          email: authData.email,
          password: "test",
          role_id: null
        };

        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが重複しているためユーザの作成に失敗しました"
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("64文字以上の場合", () => {
        let payload;
        let user = {
          account_name: "jiro",
          name: "jiro",
          email: "jugemjugemjugemjugemjugemjugemjugemjugemjugemjugemjugem@jugem.com",
          password: "test",
          role_id: null
        };

        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "メールアドレスが制限文字数(64)を超過したためユーザの作成に失敗しました"
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });

      });

      // emailの妥当性はライブラリを使用する
      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        describe("バックスラッシュ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j\\i\\r\\o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
        describe("スラッシュ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j/i/r/o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("コロン", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j:i:r:o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("アスタリスク", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j*i*r*o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j?i?r?o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j<i<r<o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j>i>r>o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "メールアドレスに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            email: "j|i|r|o",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("passwordが", () => {
      describe("undefinedの場合", () => {
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "パスワードが空のためユーザの作成に失敗しました"
        };

        let payload;
        let user = {
          account_name: "jiro",
          name: "jiro",
          email: "example@localhost",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "パスワードが空のためユーザの作成に失敗しました"
        };

        let payload;
        let user = {
          account_name: "jiro",
          password: null,
          name: "jiro",
          email: "example@localhost",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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
        let expected = {
          message: "ユーザの作成に失敗しました",
          detail: "パスワードが空のためユーザの作成に失敗しました"
        };

        let payload;
        let user = {
          account_name: "jiro",
          password: "",
          name: "jiro",
          email: "example@localhost",
          role_id: null
        };

        before( done => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => {
              user.role_id = head(res.body.body)._id;

              request
                .post(users_url)
                .send({ user })
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

      // 対象外
      describe.skip("禁止文字(\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        describe("バックスラッシュ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t\\e\\s\\t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t/e/s/t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("コロン", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t:e:s:t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("アスタリスク", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t*e*s*t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("クエスション", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t?e?s?t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t<e<s<t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t>e>s>t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", () => {
          let expected = {
            message: "ユーザの作成に失敗しました",
            detail: "パスワードに禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          let payload;
          let user = {
            account_name: "jiro",
            name: "jiro",
            password: "t|e|s|t",
            email: "example@localhost",
            password: "test",
            role_id: null
          };

          before( done => {
            request
              .get("/api/v1/role_menus")
              .end( (err, res) => {
                user.role_id = head(res.body.body)._id;

                request
                  .post(users_url)
                  .send({ user })
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

          it("statusはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
      });
    });
  });

  // ユーザとグループの一覧
  describe("get /with_groups", () => {
    it("frontから呼ばれていないのでテスト不要");
  });

});
