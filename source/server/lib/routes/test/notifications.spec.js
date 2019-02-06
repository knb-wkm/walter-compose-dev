import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { intersection, uniq, has, first,range } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";
import User from "../../models/User";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use("/", Router);

const base_url = "/api/v1/notifications";
const login_url = "/api/login";

const request = defaults(supertest(app));
let auth;

describe(base_url, () => {
  before ( done => {
    initdbPromise.then( () => {
      request.post(login_url)
        .send(authData)
        .end( (err, res) => {
          request.set("x-auth-cloud-storage", res.body.body.token);
          done();
        });
    });
  });

  describe("get /", () => {
    it("http(200)が返却される", done => {
      request.get(base_url)
        .expect(200)
        .end( ( err, res ) => {
          expect(res.status).equal(200);
          done();
        });
    });
    it("返却値に success が含まれる", done =>{
      request.get(base_url)
        .end( (err, res) => {
          expect(has(res.body.status,'success')).equal(true);
          expect(res.body.status.success).equal(true);
          done();
        });
    });
    it("返却値に total が含まれる", done =>{
      request.get(base_url)
        .end( (err, res) => {
          expect(has(res.body.status,'total')).equal(true);
          done();
        });
    });
    it("返却値に unread が含まれる", done =>{
      request.get(base_url)
        .end( (err, res) => {
          expect(has(res.body.status,'unread')).equal(true);
          done();
        });
    });
    it("返却値に page が含まれる", done =>{
      request.get(base_url)
        .end( (err, res) => {
          expect(has(res.body.status,'page')).equal(true);
          done();
        });
    });
  });

  describe("post /", () => {

    describe("request notifications がundefinedの場合", () => {
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "お知らせが空のためお知らせの登録に失敗しました"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .end( (err, res) => {
            expect(res.body.status.errors.notifications).equal(expected.detail);
            done();
          });
      });
    });

    describe("request title が undefined の場合", () => {
      const body = { "notifications":{} };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "タイトルが空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.title).equal(expected.detail);
            done();
          });
      });
    });

    describe("request title が null の場合", () => {
      const body = { "notifications":{ title:null } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "タイトルが空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.title).equal(expected.detail);
            done();
          });
      });
    });

    describe('request title が "" の場合', () => {
      const body = { "notifications":{ title: "" } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "タイトルが空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.title).equal(expected.detail);
            done();
          });
      });
    });

    describe('request body が undefined の場合', () => {
      const body = { "notifications":{
          title: "お知らせテスト"
         } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "本文が空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.body).equal(expected.detail);
            done();
          });
      });
    });

    describe('request body が null の場合', () => {
      const body = { "notifications":{
          title: "お知らせテスト",
          body: null
         } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "本文が空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.body).equal(expected.detail);
            done();
          });
      });
    });

    describe('request body が "" の場合', () => {
      const body = { "notifications":{
          title: "お知らせテスト",
          body: ""
         } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "本文が空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.body).equal(expected.detail);
            done();
          });
      });
    });

    describe('request users が undefined の場合', () => {
      const body = { "notifications":{
          title: "お知らせテスト",
          body: "お知らせの本文"
         } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "ユーザーが空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.users).equal(expected.detail);
            done();
          });
      });
    });

    describe('request users が null の場合', () => {
      const body = { "notifications":{
          title: "お知らせテスト",
          body: "お知らせの本文",
          users: null
         } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "ユーザーが空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.users).equal(expected.detail);
            done();
          });
      });
    });

    describe('request users が null の場合', () => {
      const body = { "notifications":{
          title: "お知らせテスト",
          body: "お知らせの本文",
          users: ""
         } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "ユーザーが空です"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.users).equal(expected.detail);
            done();
          });
      });
    });

    describe('request users に存在しないユーザを指定した場合', () => {
      const body = { "notifications":{
          title: "お知らせテスト",
          body: "お知らせの本文",
          users: [ mongoose.Types.ObjectId('aa000538487b17bb156ffdd1') ]
         } };
      // 期待するエラーの情報
      const expected = {
        message: "お知らせの登録に失敗しました",
        detail: "指定されたユーザーが存在しないためお知らせの登録に失敗しました"
      };

      it("http(400)が返却される", done => {
        request.post(base_url)
        .send(body)
        .expect(400)
        .end( (err, res) => {
          expect(res.status).equal(400);
          done();
        });
      });

      it("status は false", done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.success).equal(false);
            done();
          });
      });

      it(`エラーの概要は「${expected.message}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.message).equal(expected.message);
            done();
          });
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        request.post(base_url)
          .send(body)
          .end( (err, res) => {
            expect(res.body.status.errors.user).equal(expected.detail);
            done();
          });
      });
    });

    describe('お知らせの登録,および,取得',() => {

      // 登録するデータ
      const body = { notifications:{
        title: "お知らせテスト",
        body: "お知らせの本文"
      }};

      describe('taroにお知らせを登録',() => {
        it('http(200)が返却される',done => {
          User.findOne({ name:"taro" },(err,res)=>{
            body.notifications.users = [res._id];

            request.post(base_url)
            .send(body)
            .expect(200)
            .end( (err, res) => {
              expect(res.status).equal(200);
              done();
            });

          });
        });
      });

      describe('ログインユーザ（taro）のお知らせを取得する',() => {
        it('お知らせが一件登録されている',done => {
          request.get(base_url)
            .expect(200)
            .end((err,res) => {
              expect(res.body.body.length).equal(1);
              expect(res.body.status.total).equal(1);
              done();
            });
        });

        it('お知らせの未読件数が1件',done => {
          request.get(base_url)
          .expect(200)
          .end((err,res) => {
            expect(res.body.status.unread).equal(1);
            done();
          });
        });

        it(`お知らせのタイトルが「${body.notifications.title}」`,done => {
          request.get(base_url)
            .expect(200)
            .end((err,res) => {
              expect(first(res.body.body).notifications.title).equal(body.notifications.title);
              done();
            });
        });

        it(`お知らせの本文が「${body.notifications.body}」`,done => {
          request.get(base_url)
            .expect(200)
            .end((err,res) => {
              expect(first(res.body.body).notifications.body).equal(body.notifications.body);
              done();
            });
        });

        it('お知らせの状態が未読',done => {
          request.get(base_url)
          .expect(200)
          .end((err,res) => {
            expect(first(res.body.body).notifications.read).equal(false);
            done();
          });
        });
      });
    });

    describe('登録されているお知らせを既読にする',() => {

      it('http(200)が返却される',done => {
        request.get(base_url)
        .expect(200)
        .end((err,res) => {
          const body = {
            notifications:[ first(res.body.body).notifications._id ]
          };
          request.patch(`${base_url}/read`)
          .send(body)
          .expect(200)
          .end( (err, res) => {
            expect(res.status).equal(200);
            done();
          });
        });
      });
      it('お知らせの状態が既読',done => {
        request.get(base_url)
        .expect(200)
        .end((err,res) => {
          expect(first(res.body.body).notifications.read).equal(true);
          done();
        });
      });

    });

    describe('お知らせを複数(10件)登録する',() => {

      before(done => {

        // 登録するデータ
        const body = { notifications:{
          title: "お知らせテスト",
          body: "お知らせの本文"
        }};

        User.findOne({ name:"taro" },(err,res)=>{
          body.notifications.users = [res._id];
          const hoge = range(2 , 12).map((i)=>{

            body.notifications.title;
            body.notifications.body;

            return new Promise((resolve, reject) => {
              request.post(base_url).send(body).expect(200).end((err,res)=>{
                resolve(res.body.body);
              });
          });

          });

          Promise.all(hoge).then(res => {
            done();
          });

        });


      });

      it(`お知らせが全11件,うち未読10件が登録されている`,done => {
        request.get(base_url)
          .expect(200)
          .end((err,res) => {
            expect(res.body.status.total).equal(11);
            expect(res.body.status.unread).equal(10);
            done();
          });
      });

      describe('1ページ目を取得',() => {
        it(`取得件数が5件である`, done => {
          request.get(base_url)
          .expect(200)
          .end((err,res) => {
            expect(res.body.body.length).equal(5);
            done();
          });
        });
      });
      describe('2ページ目を取得',() => {
        it(`取得件数が5件である`, done => {
          request.get(base_url)
          .query({ page: '1' })
          .expect(200)
          .end((err,res) => {
            expect(res.body.body.length).equal(5);
            done();
          });
        });
      });
      describe('3ページ目を取得',() => {
        it(`取得件数が1件である`, done => {
          request.get(base_url)
          .query({ page: '2' })
          .expect(200)
          .end((err,res) => {
            expect(res.body.body.length).equal(1);
            done();
          });
        });
        it(`既読件数が1件である`, done => {
          request.get(base_url)
          .query({ page: '2' })
          .expect(200)
          .end((err,res) => {
            const readNotification = res.body.body.filter(notification => {
              return notification.notifications.read === true;
            });
            expect(readNotification.length).equal(1);
            done();
          });
        });
      });
    });

  });

});
