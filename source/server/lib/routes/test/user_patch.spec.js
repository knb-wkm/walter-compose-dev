import util from "util";
import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import * as _ from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use("/", Router);

const user_url = "/api/v1/users";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;

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

  // ユーザ有効/無効のトグル
  describe("patch /:user_id/enabled", () => {
    let toggleUser;

    // ログインユーザ以外をピックアップ
    before( done => {
      request
        .get(user_url)
        .end( (err, res) => {
          const __user = res.body.body.filter( _user => (
            _user.enabled === true && _user._id !== user._id
          ));

          toggleUser = _.head(__user);
          done();
        });
    });

    // 対象のユーザが無効だった場合、有効に戻す後処理
    afterEach( done => {
      new Promise( (resolve, reject) => {
        request
          .get(user_url + `/${toggleUser._id}`)
          .end( (err, res) => resolve(res) );
      }).then( res => {
        if (res.body.body.enabled === false) {
          return new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${toggleUser._id}/enabled`)
              .end( (err, res) => resolve(res) );
          });
        } else {
          return new Promise( (resolve, reject) => resolve() );
        }
      }).then( res => {
        done();
      });
    });

    describe("有効な状態である他ユーザのuser_idを指定した場合", () => {
      let payload;
      let nextPayload;

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${toggleUser._id}/enabled`)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .get(user_url + `/${toggleUser._id}`)
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

      it("ユーザ詳細を取得した結果、enabled = falseとなる", done => {
        expect(nextPayload.body.body.enabled).equal(false);
        done();
      });
    });

    describe("変更されたユーザがログインした場合", () => {
      let payload;
      let expected = {
        message: "ユーザ認証に失敗しました",
        detail: "指定されたユーザは現在無効状態のためユーザ認証に失敗しました"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${toggleUser._id}/enabled`)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          return new Promise( (resolve, reject) => {
            request
              .get(user_url + `/${toggleUser._id}`)
              .end( (err, res) => resolve(res) );
          });
        }).then( res => {
          return new Promise( (resolve, reject) => {
            request
              .post(login_url)
              .send({
                account_name: toggleUser.account_name,
                password: "test"
              })
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
        expect(payload.body.status.errors.account_name).equal(expected.detail);
        done();
      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let expected = {
          message: "ユーザの有効化/無効化に失敗しました",
          detail: "ユーザIDが不正のためユーザの有効化/無効化に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/invalid_oid/enabled`)
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

  // アカウント名変更
  describe("patch /:user_id/account_name", () => {
    let changeUser;

    before( done => {
      request
        .get(user_url)
        .end( (err, res) => {
          const __user = res.body.body.filter( _user => (
            _user.enabled === true && _user._id !== user._id
          ));

          changeUser = _.head(__user);
          done();
        });
    });

    describe("他ユーザのuser_id, 正しいaccount_nameを指定した場合", () => {
      let payload;
      let nextPayload;

      let body = {
        account_name: "foobar"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${changeUser._id}/account_name`)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .get(user_url + `/${changeUser._id}`)
              .end( (err, res) => resolve(res) );
          });
        }).then( res => {
          nextPayload = res;
          done();
        });
      });

      // 変更したaccount_nameを元に戻しておく
      after( done => {
        request
          .patch(user_url + `/${changeUser._id}/account_name`)
          .send({ account_name: changeUser.account_name })
          .end( (err, res) => {
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("ユーザ詳細を取得した結果、account_nameが変更された値として返却される", done => {
        expect(nextPayload.body.body.account_name).equal(body.account_name);
        done();
      });

      describe("変更したユーザにて変更後のaccount_nameでログインした場合", () => {
        let payload;

        before( done => {
          request
            .post(login_url)
            .send({
              account_name: body.account_name,
              password: "test"
            })
            .end( (err, res) => {
              payload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(payload.status).equal(200);
          done();
        });

        it("トークンが返却される", done => {
          expect(payload.body.body.token.length > 0).equal(true);
          done();
        });

        it("ユーザオブジェクトが返却される", done => {
          expect(payload.body.body.user._id.length > 0).equal(true);
          done();
        });

      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let expected = {
          message: "ログイン名の変更に失敗しました",
          detail: "ユーザIDが不正のためログイン名の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/invalid_oid/account_name`)
            .send({ account_name: "foobar" })
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

    describe("指定されたaccount_nameが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let body = {};
        let expected = {
          message: "ログイン名の変更に失敗しました",
          detail: "アカウント名が空のためログイン名の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/account_name`)
            .send(body)
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
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let body = { account_name: null };
        let expected = {
          message: "ログイン名の変更に失敗しました",
          detail: "アカウント名が空のためログイン名の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/account_name`)
            .send(body)
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
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let body = { account_name: "" };
        let expected = {
          message: "ログイン名の変更に失敗しました",
          detail: "アカウント名が空のためログイン名の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/account_name`)
            .send(body)
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
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      describe("255文字以上の場合", () => {
        let payload;
        let body = {
          account_name: _.range(257).map(i => "1").join("")
        };

        let expected = {
          message: "ログイン名の変更に失敗しました",
          detail: "アカウント名が規定文字数(255)を超過したためログイン名の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/account_name`)
            .send(body)
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
          expect(payload.body.status.errors.account_name).equal(expected.detail);
          done();
        });
      });

      // account_nameは禁止文字の対象外
      describe.skip("禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        describe("バックスラッシュ", () => {
          let payload;
          let body = {
            account_name: "\\foo\\bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("スラッシュ", () => {
          let payload;
          let body = {
            account_name: "/foo/bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });

        });

        describe("コロン", () => {
          let payload;
          let body = {
            account_name: ":foo:bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });

        });

        describe("アスタリスク", () => {
          let payload;
          let body = {
            account_name: "*foo*bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });

        });

        describe("クエスチョン", () => {
          let payload;
          let body = {
            account_name: "?foo?bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧開く", () => {
          let payload;
          let body = {
            account_name: "<foo<bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("山括弧閉じる", () => {
          let payload;
          let body = {
            account_name: ">foo>bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });

        describe("パイプ", () => {
          let payload;
          let body = {
            account_name: "|foo|bar"
          };

          let expected = {
            message: "ログイン名の変更に失敗しました",
            detail: "ログイン名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .post(user_url + `/${changeUser._id}/account_name`)
              .send(body)
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
            expect(payload.body.status.errors.account_name).equal(expected.detail);
            done();
          });
        });
      });
    });
  });

  // ユーザの表示名変更
  describe("patch /:user_id/name", () => {
    let changeUser;

    before( done => {
      request
        .get(user_url)
        .end( (err, res) => {
          const __user = res.body.body.filter( _user => (
            _user.enabled === true && _user._id !== user._id
          ));

          changeUser = _.head(__user);
          done();
        });
    });

    describe("他ユーザのuser_id, 正しいnameを指定した場合", () => {
      let payload;
      let nextPayload;

      let body = {
        name: "foobar"
      };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${changeUser._id}/name`)
            .send(body)
            .end( (err, res) => resolve(res));
        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .get(user_url + `/${changeUser._id}`)
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

      it("ユーザ詳細を取得した結果、nameが変更された値として返却される", done => {
        expect(nextPayload.body.body.name).equal(body.name);
        done();
      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let body = {
          name: "foobar"
        };

        let expected = {
          message: "ユーザの表示名の変更に失敗しました",
          detail: "ユーザIDが不正のため表示名の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/invalid_oid/name`)
            .send(body)
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

    describe("指定されたnameが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let body = {
        };

        let expected = {
          message: "ユーザの表示名の変更に失敗しました",
          detail: "表示名が空のため変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/name`)
            .send(body)
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
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let body = {
          name: null
        };

        let expected = {
          message: "ユーザの表示名の変更に失敗しました",
          detail: "表示名が空のため変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/name`)
            .send(body)
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
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let body = {
          name: ""
        };

        let expected = {
          message: "ユーザの表示名の変更に失敗しました",
          detail: "表示名が空のため変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/name`)
            .send(body)
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
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe("255文字以上の場合", () => {
        let payload;
        let body = {
          name: _.range(257).map( i => "1" ).join("")
        };

        let expected = {
          message: "ユーザの表示名の変更に失敗しました",
          detail: "表示名が規定文字数(255)を超過したため変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${changeUser._id}/name`)
            .send(body)
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
          expect(payload.body.status.errors.name).equal(expected.detail);
          done();
        });
      });

      describe.skip("禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", () => {
        describe("バックスラッシュ", () => {
          let payload;
          let body = {
            name: "\\foo\\bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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

        describe("スラッシュ", () => {
          let payload;
          let body = {
            name: "/foo/bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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

        describe("コロン", () => {
          let payload;
          let body = {
            name: ":foo:bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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

        describe("アスタリスク", () => {
          let payload;
          let body = {
            name: "*foo*bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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

        describe("クエスチョン", () => {
          let payload;
          let body = {
            name: "?foo?bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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

        describe("山括弧開く", () => {
          let payload;
          let body = {
            name: "<foo<bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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

        describe("山括弧閉じる", () => {
          let payload;
          let body = {
            name: ">foo>bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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

        describe("パイプ", () => {
          let payload;
          let body = {
            name: "|foo|bar"
          };

          let expected = {
            message: "ユーザの表示名の変更に失敗しました",
            detail: "表示名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
          };

          before( done => {
            request
              .patch(user_url + `/${changeUser._id}/name`)
              .send(body)
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
  });

  // メールアドレス変更
  describe("patch /:user_id/email", () => {
    describe("他ユーザのuser_id, 正しいemailを指定した場合", () => {
      let payload;
      let nextPayload;

      let body = { email: "foobar@example.com" };

      before( done => {
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${user._id}/email`)
            .send(body)
            .end( (err, res) => resolve(res) );
        }).then(res => {
          payload = res;
          return new Promise( (resolve, reject) => {
            request
              .get(user_url + `/${user._id}`)
              .end( (err, res) => resolve(res));
          });
        }).then(res => {
          nextPayload = res;
          done();
        });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      it("ユーザ詳細を取得した結果、emailが変更された値として返却される", done => {
        expect(nextPayload.body.body.email).equal(body.email);
        done();
      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let body = { email: "foobar@example.com" };
        let expected = {
          message: "メールアドレスの変更に失敗しました",
          detail: "ユーザIDが不正のためメールアドレスの変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/invalid_oid/email`)
            .send(body)
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

    describe("指定されたemailが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let body = {};
        let expected = {
          message: "メールアドレスの変更に失敗しました",
          detail: "指定されたメールアドレスが空のためメールアドレスの変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${user._id}/email`)
            .send(body)
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
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let body = { email: null };
        let expected = {
          message: "メールアドレスの変更に失敗しました",
          detail: "指定されたメールアドレスが空のためメールアドレスの変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${user._id}/email`)
            .send(body)
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
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let nextPayload;
        let body = { email: "" };

        before( done => {
          new Promise( (resolve, reject) => {
            request
              .patch(user_url + `/${user._id}/email`)
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
      });

      describe("64文字以上の場合", () => {
        let payload;
        let body = {
          email: "jugemjugemjugemjugemjugemjugemjugemjugemjugemjugemjugem@jugem.com"
        };
        let expected = {
          message: "メールアドレスの変更に失敗しました",
          detail: "メールアドレスが規定文字数(64)を超過したためメールアドレスの変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${user._id}/email`)
            .send(body)
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
          expect(payload.body.status.errors.email).equal(expected.detail);
          done();
        });
      });

      describe("禁止文字(RFC5322における)が含まれている場合", () => {
        it.skip("ライブラリを使用するので本テストではスコープ外");
      });
    });

  });

  // 所属グループの削除
  describe("delete /:user_id/groups/:group_id", () => {
    describe("user_id, group_idを正しく指定した場合", () => {
      let payload;
      let nextPayload;
      let group_id;

      before( done => {
        group_id = _.head(user.groups);

        new Promise( (resolve, reject) => {
          request
            .delete( user_url + `/${user._id}/groups/${group_id}` )
            .end( (err, res) => resolve(res) );
        }).then( res => {
          payload = res;

          return new Promise( (resolve, reject) => {
            request
              .get( user_url + `/${user._id}` )
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

      it("変更したユーザを取得した場合、削除したグループが含まれていない", done => {
        const exists = nextPayload.body.body.groups.every( group => group !== group_id );
        expect(exists).equal(true);
        done();
      });

      it("ユーザの所属するグループ数が1つのみ減少している", done => {
        expect(user.groups.length - 1).equal(nextPayload.body.body.groups.length);
        done();
      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let group_id;
        let expected = {
          message: "グループのメンバ削除に失敗しました",
          detail: "ユーザIDが不正のためグループのメンバ削除に失敗しました"
        };

        before( done => {
          group_id = _.head(user.groups);

          request
            .delete(user_url + `/invalid_oid/groups/${group_id}`)
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

    describe("指定されたgroup_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let expected = {
          message: "グループのメンバ削除に失敗しました",
          detail: "グループIDが不正のためグループのメンバ削除に失敗しました"
        };

        before( done => {
          request
            .delete(user_url + `/${user._id}/groups/invalid_oid`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("userが所属していないgroup_idの場合", () => {
        let payload;
        let group_id;
        let expected = {
          message: "グループのメンバ削除に失敗しました",
          detail: "指定されたグループにユーザが所属していないためグループのメンバ削除に失敗しました"
        };

        before( done => {
          group_id = _.head(user.groups);

          new Promise( (resolve, reject) => {
            request
              .delete(user_url + `/${user._id}/groups/${group_id}`)
              .end( (err, res) => resolve(res) );
          }).then( res => {
            return new Promise( (resolve, reject) => {
              request
                .delete(user_url + `/${user._id}/groups/${group_id}`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });
    });

  });

  // メニューロールの変更
  describe("patch /:user_id/role_menus", () => {
    let otherUser;
    let role_id;

    before( done => {
      new Promise( (resolve, reject) => {
        // 自分以外のユーザを取得
        request
          .get(user_url)
          .end( (err, res) => resolve(res) );
      }).then( res => {
        otherUser = _.head(res.body.body.filter( _user => _user._id !== user._id ));

        // role_menu付きのユーザオブジェクトが欲しいので
        return new Promise( (resolve, reject) => {
          request
            .get(user_url + `/${otherUser._id}`)
            .end( (err, res) => resolve(res) );
        });

      }).then( res => {
        otherUser = res.body.body;

        // role_menu一覧
        return new Promise( (resolve, reject) => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => resolve(res) );
        });

      }).then( res => {
        role_id = res.body.body
          .filter( role => role._id !== otherUser.role_id )[0]._id;
        done();
      });

    });

    describe("user_id, 追加したいrole_menu_idを正しく指定した場合", () => {
      let payload;
      let nextPayload;

      before( done => {
          // メニューロール変更
        new Promise( (resolve, reject) => {
          request
            .patch(user_url + `/${otherUser._id}/role_menus`)
            .send({ role_menu_id: role_id })
            .end( (err, res) => resolve(res) );
        }).then( res => {
          payload = res;

          // 反映されているかどうか
          return new Promise( (resolve, reject) => {
            request
              .get(user_url + `/${otherUser._id}`)
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

      it("変更したユーザを取得した場合、追加したロールメニューを含めた結果が返却される", done => {
        expect(nextPayload.body.body.role_id).equal(role_id);
        done();
      });
    });

    describe("指定されたuser_idが", () => {
      describe("存在しないoidの場合", () => {
        let payload;
        let expected = {
          message: "メニュー権限の変更に失敗しました",
          detail: "ユーザIDが不正のためメニュー権限の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + "/invalid_oid/role_menus")
            .send({ role_menu_id: role_id })
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

    describe("指定されたrole_menu_idが", () => {
      describe("undefinedの場合", () => {
        let payload;
        let body = {};
        let expected = {
          message: "メニュー権限の変更に失敗しました",
          detail: "メニュー権限IDが空のためメニュー権限の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${user._id}/role_menus`)
            .send(body)
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
          expect(payload.body.status.errors.role_menu_id).equal(expected.detail);
          done();
        });
      });

      describe("nullの場合", () => {
        let payload;
        let body = { role_menu_id: null };
        let expected = {
          message: "メニュー権限の変更に失敗しました",
          detail: "メニュー権限IDが空のためメニュー権限の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${user._id}/role_menus`)
            .send(body)
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
          expect(payload.body.status.errors.role_menu_id).equal(expected.detail);
          done();
        });
      });

      describe("空文字の場合", () => {
        let payload;
        let body = { role_menu_id: "" };
        let expected = {
          message: "メニュー権限の変更に失敗しました",
          detail: "メニュー権限IDが空のためメニュー権限の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${user._id}/role_menus`)
            .send(body)
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
          expect(payload.body.status.errors.role_menu_id).equal(expected.detail);
          done();
        });
      });

      describe("存在しないoidの場合", () => {
        let payload;
        let body = { role_menu_id: "invalid_oid" };
        let expected = {
          message: "メニュー権限の変更に失敗しました",
          detail: "メニュー権限IDが不正のためメニュー権限の変更に失敗しました"
        };

        before( done => {
          request
            .patch(user_url + `/${user._id}/role_menus`)
            .send(body)
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
          expect(payload.body.status.errors.role_menu_id).equal(expected.detail);
          done();
        });

      });
    });

  });
});
