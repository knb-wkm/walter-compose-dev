import util from "util";
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";

import { app, mongoUrl, initdbPromise } from "./builder";

const base_url = "/api/login";

describe(base_url, () => {
  app.use("/", Router);
  mongoose.connect(mongoUrl, { useMongoClient: true });

  // 前処理でdbを初期化しておく
  // shellがtimeoutになる場合、mochaの--timeoutオプションを変更する
  before( done => {
    initdbPromise.then( () => done() );
  });

  describe("post /", () => {
    describe("request bodyがundefineの場合", () => {

      // 期待するエラーの情報
      const expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名が空のためユーザ認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(base_url)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it("statusはfalse", done => {
        request(app)
          .post(base_url)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(base_url)
          .end( (err, res) => {
            expect(res.body.status.message)
              .equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(base_url)
          .end( (err, res) => {
            expect(res.body.status.errors.account_name)
              .equal(expected.detail);
            done();
          });
      });

    });

    describe("account_nameがnullの場合", () => {
      const body = { account_name: null };
      const expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名が空のためユーザ認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it("statusはfalse", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.account_name)
              .equal(expected.detail);
            done();
          });
      });
    });

    describe("passwordがnullの場合", () => {
      const body = { account_name: "hanako", password: null };
      const expected = {
        message: "ユーザ認証に失敗しました",
        detail: "パスワードが空のためユーザ認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it("statusはfalse", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.password)
              .equal(expected.detail);
            done();
          });
      });

    });

    describe("指定されたaccount_nameがユーザマスタに存在しない場合", () => {
      const body = { account_name: "nanashi", password: "nanashi" };
      const expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名またはパスワードが不正のため認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it("statusはfalse", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.account_name)
              .equal(expected.detail);
            done();
          });
      });
    });

    describe("パスワードが保存されたものと一致しない場合", () => {
      const body = { account_name: "hanako", password: "xxxx" };
      const expected = {
        message: "ユーザ認証に失敗しました",
        detail: "アカウント名またはパスワードが不正のため認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it("statusはfalse", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.password).equal(expected.detail);
            done();
          });
      });

    });

    describe("適切なaccount_name, passwordを渡した場合", () => {
      const body = { account_name: "hanako", password: "test" };
      const expected = {
        message: "ユーザ認証に成功しました"
      };

      it("http(200)が返却される", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(200);
            done();
          });
      });

      it(`概要は「${expected.message}」`, done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it("100文字以上のtoken文字列が返却される", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.body.token.length > 100).equal(true);
            done();
          });
      });

      it("ユーザの_id, tenant_idを含んだオブジェクトが返却される", done => {
        request(app)
          .post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.body.user._id.length > 0).equal(true);
            expect(res.body.body.user.tenant_id.length > 0).equal(true);
            done();
          });
      });

    });

  });

  describe("post /verify_token", () => {
    const verify_token_url = base_url + "/verify_token";

    describe("tokenが未定義の場合", () => {
      const body = {};
      const expected = {
        message: "トークン認証に失敗しました",
        detail: "ログイントークンが空のためトークン認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.token).equal(expected.detail);
            done();
          });
      });
    });

    describe("tokenがnullの場合", () => {
      const body = {token: null};
      const expected = {
        message: "トークン認証に失敗しました",
        detail: "ログイントークンが空のためトークン認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.token).equal(expected.detail);
            done();
          });
      });

    });

    describe("tokenの検証に失敗した場合", done => {
      const body = { token: "foobazbar" };
      const expected = {
        message: "トークン認証に失敗しました",
        detail: "ログイントークンが不正のためトークン認証に失敗しました"
      };

      it("http(400)が返却される", done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(400);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.token).equal(expected.detail);
            done();
          });
      });

    });

    describe("検証可能なトークンを渡した場合", done => {
      let body = {};
      const expected = {
        message: "トークン認証に成功しました"
      };

      before( done => {
        request(app)
          .post(base_url)
          .send({ account_name: "hanako", password: "test" })
          .end( (err, res) => {
            body.token = res.body.body.token;
            done();
          });
      });

      it("http(200)が返却される", done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.status).equal(200);
            done();
          });
      });

      // 成功時はメッセージ不要
      it.skip(`概要は「${expected.message}」`, done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it("ユーザid, nameを含んだユーザオブジェクトが返却される", done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.body.user._id.length > 0).equal(true);
            expect(res.body.body.user.name.length > 0).equal(true);
            done();
          });
      });

      it("token期限の開始、終了が返却される", done => {
        request(app)
          .post(verify_token_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.body.user.iat * 2 > 1).equal(true);
            done();
          });
      });

    });

  });

});
