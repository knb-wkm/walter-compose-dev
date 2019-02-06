import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { isArray, first, has, findIndex, isString, isMatch } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";
import { changeLabel } from "../../controllers/tags";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/tags";
const login_url = "/api/login";

const request = defaults(supertest(app));
let tenant_id = "";

describe(base_url,() => {
  before ( done => {
    initdbPromise.then( () => {
      request.post(login_url)
        .send(authData)
        .end( (err, res) => {
          tenant_id = res.body.body.user.tenant_id;
          request.set('x-auth-cloud-storage', res.body.body.token);
          done();
        });
    });
  });

  describe('get /', () =>{
    let response = {};
    before(done => {
      request.get(base_url)
      .end( ( err, res ) => {
        response = res;
        done();
      });
    });

    it('http(200)が返却される', done => {
      expect(response.status).equal(200);
      done();
    });
    it('bodyに配列が含まれる', done => {
      expect( isArray(response.body.body)).equal(true);
      done();
    });
    it('tagが1件以上登録されている',done => {
      expect( response.body.body.length >= 1).equal(true);
      done();
    });
    it('tagsには_idが含まれる', done => {
      const tag = first(response.body.body);
      expect( has(tag, "_id") ).equal(true);
      done();
    });
    it('_idはmongoose.Types.ObjectIdである', done => {
      const tag = first(response.body.body);
      expect(mongoose.Types.ObjectId.isValid(tag._id)).equal(true);
      done();
    });
    it('tagsにはcolorが含まれる', done => {
      const tag = first(response.body.body);
      expect( has(tag, "color") ).equal(true);
      done();
    });
    it('colorは16進数トリプレット表記である', done => {
      const tag = first(response.body.body);
      expect( tag.color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/) ).not.equal(null);
      done();
    });
    it('tagsにはlabelが含まれる', done => {
      const tag = first(response.body.body);
      expect( has(tag, "label") ).equal(true);
      done();
    });
    it('labelは文字列である', done => {
      const tag = first(response.body.body);
      expect(isString(tag.label)).equal(true);
      done();
    });
    it('tagsにはtenant_idが含まれる', done => {
      const tag = first(response.body.body);
      expect( has(tag, "tenant_id") ).equal(true);
      done();
    });
    it('tenant_idがログインしているtenantのidと一致する', done => {
      const tag = first(response.body.body);
      expect( tag.tenant_id ).equal(tenant_id);
      done();
    });
  });

  describe('post /', () => {

    describe("異常系",()=>{

      describe("labelが未定義",()=>{
        const expected = {
          message: "タグの登録に失敗しました",
          detail: "タグ名が空です"
        };

        describe("labelがundefined",() => {

          const body = { tag:{} };
          let response = {};

          before(done => {
            request.post(base_url)
            .send(body)
            .end( ( err, res ) => {
              response = res;
              done();
            });
          });

          it('http(400)が返却される', done => {
              expect(response.status).equal(400);
              done();
          });

          it('statusはfalse',done => {
            expect(response.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(response.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(response.body.status.errors.label).equal(expected.detail);
            done();
          });

        });

        describe('labelがnull', () => {

          const body = { tag:{
            label: null
          } };
          let response = {};

          before(done => {
            request.post(base_url)
            .send(body)
            .end( ( err, res ) => {
              response = res;
              done();
            });
          });

          it('http(400)が返却される', done => {
              expect(response.status).equal(400);
              done();
          });

          it('statusはfalse',done => {
            expect(response.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(response.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(response.body.status.errors.label).equal(expected.detail);
            done();
          });

        });

        describe('labelが""', () => {

          const body = { tag:{
            label: ""
          } };
          let response = {};

          before(done => {
            request.post(base_url)
            .send(body)
            .end( ( err, res ) => {
              response = res;
              done();
            });
          });

          it('http(400)が返却される', done => {
              expect(response.status).equal(400);
              done();
          });

          it('statusはfalse',done => {
            expect(response.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(response.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(response.body.status.errors.label).equal(expected.detail);
            done();
          });

        });

      });

      describe('labelが長過ぎる場合',() => {
        const expected = {
          message: "タグの登録に失敗しました",
          detail: "タグ名が長すぎます"
        };

        const body = { tag:{
          label: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
        } };
        let response = {};

        before(done => {
          request.post(base_url)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('送信するlabelのlengthが256である',done => {
          expect(body.tag.label.length).equal(256);
          done();
        });

        it('http(400)が返却される', done => {
            expect(response.status).equal(400);
            done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.label).equal(expected.detail);
          done();
        });
      });

      describe('colorに16進トリプレット表記以外を指定',()=>{
        const expected = {
          message: "タグの登録に失敗しました",
          detail: "色は16進数で指定してください"
        };

        const body = { tag:{
          label: "新規ラベル",
          color: "#GA00Z4"
        } };
        let response = {};

        before(done => {
          request.post(base_url)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.color).equal(expected.detail);
          done();
        });

      });

      describe('labelが重複',() => {
        const expected = {
          message: "タグの登録に失敗しました",
          detail: "そのタグ名は既に使用されています"
        };
        const body = {
          tag:{
            label: "非表示",
            color: "#FFEEFF"
          }
        };
        let response;
        before(done => {
          request.post(base_url)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.label).equal(expected.detail);
          done();
        });

      });

    });

    describe("正常系",()=>{

      const sendData = {
        tag:{
          label:"新規",
          color:"#FEDCBA"
        }
      };

      let DatalengthBeforPost = 0;

      before(done => {
        request.get(base_url)
        .end( ( err, res ) => {
          DatalengthBeforPost = res.body.body.length;
          done();
        });
      });

      it('http(200)が返却される', done => {
        const body = sendData;
        request.post(base_url)
        .send(body)
        .end( ( err, res ) => {
          expect(res.status).equal(200);
          done();
        });
      });

      it('レコードが一件追加されていること',done => {
        request.get(base_url)
        .end( ( err, res ) => {
          expect(res.body.body.length).equal(DatalengthBeforPost + 1);
          done();
        });

      });

      it('送信した内容でタグが追加されていること',done => {
        request.get(base_url)
        .end( ( err, res ) => {
          expect( findIndex(res.body.body,sendData.tag) ).not.equal(-1);
          done();
        });
      });

    });

  });

  describe('get /:tag_id', () => {
    describe('異常系',()=>{
      describe('tag_idが未定義', () => {
        it('"get /" となるためpending',done=>{done();});
      });
      describe('存在しないtag_idを指定', done => {

        const expected = {
          message: "タグの取得に失敗しました",
          detail: "指定されたタグが存在しないためタグの取得に失敗しました"
        };
        let response ;
        before(done=>{
          const newId = new mongoose.Types.ObjectId();
          request.get(`${base_url}/${newId}`)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag).equal(expected.detail);
          done();
        });


      });
      describe('tag_idにでたらめな文字列を指定', done => {
        const expected = {
          message: "タグの取得に失敗しました",
          detail: "タグIDが不正なためタグの取得に失敗しました"
        };
        let response ;
        before(done=>{
          const newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.get(`${base_url}/${newId}`)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });
      });

    });

    describe('正常系',()=>{

      let response;
      before(done => {
        request.get(base_url)
        .end( ( err, res ) => {
          const id = first(res.body.body)._id;
          // 先頭のtagを対象とする
          request.get(`${base_url}/${id}`)
            .end((err, res) => {
              response = res;
              done();
            });
        });
      });

      it('http(200)が返却される', done => {
        expect(response.status).equal(200);
        done();
      });

      it('返却されたtagはobjectである', done => {
        expect(typeof response.body.body).equal("object");
        done();
      });

      it('tagsにはcolorが含まれる', done => {
        expect(has(response.body.body, "color")).equal(true);
        done();
      });

      it('colorは16進数トリプレット表記である', done => {
        expect( response.body.body.color.match(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/) ).not.equal(null);
        done();
      });

      it('tagsにはlabelが含まれる', done => {
        expect(has(response.body.body, 'label')).equal(true);
        done();
      });

      it('labelはstringである',done => {
        expect( typeof response.body.body.label ).equal('string');
        done();
      });

      it('tagsにはtenant_idが含まれる', done => {
        expect(has(response.body.body, 'tenant_id')).equal(true);
        done();
     });

     it('tenant_idがログインしているtenantのidと一致する', done => {
      expect( response.body.body.tenant_id ).equal(tenant_id);
      done();
     });
    });
  });

  describe('delete /:tag_id', () => {

    let url = `${base_url}/`;

    const sendData = {
      tag:{
        label:"削除タグ",
        color:"#FEDCBA"
      }
    };

    let createdTag = {};
    before(done => {
      // 削除対象データを登録
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        createdTag = res.body.body;
        url += createdTag._id;
        done();
      });
    });

    describe('異常系',() =>{

      describe('tag_idが未定義',() => {
        it('http(404)が返却される', done => {
          request.delete(`${base_url}/`)
          .end( ( err, res ) => {
            expect(res.status).equal(404);
            done();
          });
        });
      });

      describe('存在しないtag_idを指定', () => {
        const expected = {
          message: "タグの削除に失敗しました",
          detail: "指定されたタグが存在しないためタグの取得に失敗しました"
        };

        let response = {};

        before(done =>{
          const newId = new mongoose.Types.ObjectId();
          request.delete(`${base_url}/${newId}`)
          .end((err, res) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される',done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag).equal(expected.detail);
          done();
        });

      });

      describe('tag_idにでたらめな文字列を指定', () => {
        const expected = {
          message: "タグの削除に失敗しました",
          detail: "タグIDが不正なためタグの取得に失敗しました"
        };

        let response = {};

        before(done =>{
          const newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.delete(`${base_url}/${newId}`)
          .end((err, res) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される',done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });

      });
    });

    describe('正常系',() =>{
      let response = {};
      let DataLengthBeforDelete;  // 削除前データ数
      before(done => {
        request.get(base_url).end((err,res)=>{
          DataLengthBeforDelete = res.body.body.length;
        });
        request.delete(url)
        .end((err,res) =>{
          response = res;
          done();
        });
      });

      it('http(200)が返却される', done => {
        expect(response.status).equal(200);
        done();
      });

      it('送信したidのタグが削除されている', done => {
        request.get(base_url).end((err,res)=>{
          expect( findIndex(res.body.body, createdTag) ).equal(-1);
          done();
        });
      });

      it('タグが1件のみ削除されていること', done => {
        request.get(base_url).end((err,res)=>{
          expect(res.body.body.length).equal(DataLengthBeforDelete - 1);
          done();
        });
      });
    });

  });

  describe('patch /:tag_id/label', () => {

    const sendData = {
      tag:{
        label:"新規タグ",
        color:"#FEDCBA"
      }
    };
    let createdData;
    before(done => {
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        createdData = res.body.body;
        done();
      });
    });

    describe('異常系',() => {


      describe('存在しないtag_idを指定', () => {
        const expected = {
          message: "タグ名の変更に失敗しました",
          detail: "指定されたタグが存在しないためタグ名の変更に失敗しました"
        };
        const body = {
          label: "更新"
        };
        let response = {};

        before(done =>{
          const newId = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${newId}/label`)
          .send(body)
          .end((err, res) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される',done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag).equal(expected.detail);
          done();
        });

      });

      describe('tag_idにでたらめな文字列を指定', () => {
        const expected = {
          message: "タグ名の変更に失敗しました",
          detail: "タグIDが不正なためタグ名の変更に失敗しました"
        };
        const body = {
          label: "更新"
        };
        let response = {};

        before(done =>{
          const newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(`${base_url}/${newId}/label`)
          .send(body)
          .end((err, res) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される',done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });

      });

      describe('labelが未定義',() => {
        const expected = {
          message: "タグ名の変更に失敗しました",
          detail: "タグ名が空です"
        };

        describe('labelがundefined',() => {
          const body = {
            tag:{}
          };
          let response;
          before(done => {
            request.patch(`${base_url}/${createdData._id}/label`)
            .send(body)
            .end( ( err, res ) => {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', done => {
            expect(response.status).equal(400);
            done();
          });
          it('statusはfalse',done => {
            expect(response.body.status.success).equal(false);
            done();
          });
          it(`エラーの概要は「${expected.message}」`, done => {
            expect(response.body.status.message).equal(expected.message);
            done();
          });
          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(response.body.status.errors.label).equal(expected.detail);
            done();
          });

        });


        describe('labelがnull',() => {
          const body = {
            tag:{
              label:null
            }
          };
          let response;
          before(done => {
            request.patch(`${base_url}/${createdData._id}/label`)
            .send(body)
            .end( ( err, res ) => {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', done => {
            expect(response.status).equal(400);
            done();
          });
          it('statusはfalse',done => {
            expect(response.body.status.success).equal(false);
            done();
          });
          it(`エラーの概要は「${expected.message}」`, done => {
            expect(response.body.status.message).equal(expected.message);
            done();
          });
          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(response.body.status.errors.label).equal(expected.detail);
            done();
          });

        });

        describe('labelが""',() => {
          const body = {
            tag:{
              label:""
            }
          };
          let response;
          before(done => {
            request.patch(`${base_url}/${createdData._id}/label`)
            .send(body)
            .end( ( err, res ) => {
              response = res;
              done();
            });
          });
          it('http(400)が返却される', done => {
            expect(response.status).equal(400);
            done();
          });
          it('statusはfalse',done => {
            expect(response.body.status.success).equal(false);
            done();
          });
          it(`エラーの概要は「${expected.message}」`, done => {
            expect(response.body.status.message).equal(expected.message);
            done();
          });
          it(`エラーの詳細は「${expected.detail}」`, done => {
            expect(response.body.status.errors.label).equal(expected.detail);
            done();
          });

        });

      });

      describe('labelが256文字',() => {
        const expected = {
          message: "タグ名の変更に失敗しました",
          detail: "タグ名が長すぎます"
        };
        const body = {
          label: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
        };
        let response;
        before(done => {
          request.patch(`${base_url}/${createdData._id}/label`)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('送信したlabel文字列が256文字以上である',done => {
          expect(body.label.length >= 256).equal(true);
          done();
        });

        it('http(400)が返却される', done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.label).equal(expected.detail);
          done();
        });

      });

      describe('labelが重複',() => {
        const expected = {
          message: "タグ名の変更に失敗しました",
          detail: "そのタグ名は既に使用されています"
        };
        const body = {
          label: "非表示"
        };
        let response;
        before(done => {
          request.patch(`${base_url}/${createdData._id}/label`)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.label).equal(expected.detail);
          done();
        });

      });
    });

    describe('正常系',() => {
      describe('labelのみを送信',() => {

        const body = {
          label: "更新"
        };
        let response;
        let dataLengthBeforPatch;
        let otherTags;
        before(done => {
          request.get(base_url).end((err,res) =>{
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
          });
          request.patch(`${base_url}/${createdData._id}/label`)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(200)が返却される', done => {
          expect(response.status).equal(200);
          done();
        });

        it('statusはtrue',done => {
          expect(response.body.status.success).equal(true);
          done();
        });

        it('送信したlabelに変更されること',done => {
          request.get(`${base_url}/${createdData._id}`).end((err,res) =>{
            expect(res.body.body.label).equal(body.label);
            done();
          });
        });

        it('別のタグが変更されないこと', done => {
          request.get(base_url).end((err,res) =>{
            const _otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
            expect(_otherTags.length === otherTags.length).equal(true);
            expect(isMatch(_otherTags,otherTags)).equal(true);
            done();
          });
        });
        it('新規タグがインサートされないこと', done => {
          request.get(base_url).end((err,res) =>{
            expect(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });
      });
      describe('label,colorを同時に送信',() => {

        const body = {
          label: "更新 with Color",
          color: "#000000"
        };
        let response;
        let dataLengthBeforPatch;
        let otherTags;
        before(done => {
          request.get(base_url).end((err,res) =>{
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
          });
          request.patch(`${base_url}/${createdData._id}/label`)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(200)が返却される', done => {
          expect(response.status).equal(200);
          done();
        });

        it('statusはtrue',done => {
          expect(response.body.status.success).equal(true);
          done();
        });

        it('送信したlabelに変更されること',done => {
          request.get(`${base_url}/${createdData._id}`).end((err,res) =>{
            expect(res.body.body.label).equal(body.label);
            done();
          });
        });

        it('別のタグが変更されないこと', done => {
          request.get(base_url).end((err,res) =>{
            const _otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
            expect(_otherTags.length === otherTags.length).equal(true);
            expect(isMatch(_otherTags,otherTags)).equal(true);
            done();
          });
        });
        it('新規タグがインサートされないこと', done => {
          request.get(base_url).end((err,res) =>{
            expect(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });
        it('colorを送信してもcolorが変更されないこと', done => {
          request.get(`${base_url}/${createdData._id}`).end((err,res) =>{
            expect(res.body.body.color).equal(sendData.tag.color);
            done();
          });
        });
      });
    });

  });

  describe('patch /:tag_id/color', () => {

    const sendData = {
      tag:{
        label:"色変更",
        color:"#FEDCBA"
      }
    };
    let createdData;
    before(done => {
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        createdData = res.body.body;
        done();
      });
    });

    describe('異常系',() => {


      describe('存在しないtag_idを指定', () => {
        const expected = {
          message: "色の登録に失敗しました",
          detail: "指定されたタグが存在しないため色の登録に失敗しました"
        };
        const body = {
          color: "#ABCDEF"
        };
        let response = {};

        before(done =>{
          const newId = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${newId}/color`)
          .send(body)
          .end((err, res) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される',done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag).equal(expected.detail);
          done();
        });

      });

      describe('tag_idにでたらめな文字列を指定', () => {
        const expected = {
          message: "色の登録に失敗しました",
          detail: "タグIDが不正なため色の登録に失敗しました"
        };
        const body = {
          color: "#ABCDEF"
        };
        let response = {};

        before(done =>{
          const newId = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(`${base_url}/${newId}/color`)
          .send(body)
          .end((err, res) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される',done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.tag_id).equal(expected.detail);
          done();
        });

      });

      describe('colorに16進トリプレット表記以外を指定',()=>{
        const expected = {
          message: "色の登録に失敗しました",
          detail: "色は16進数で指定してください"
        };

        const body = {
          color: "white"
        };
        let response = {};

        before(done => {
          request.patch(`${base_url}/${createdData._id}/color`)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(400)が返却される', done => {
          expect(response.status).equal(400);
          done();
        });

        it('statusはfalse',done => {
          expect(response.body.status.success).equal(false);
          done();
        });

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(response.body.status.message).equal(expected.message);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(response.body.status.errors.color).equal(expected.detail);
          done();
        });

      });

    });

    describe('正常系',() => {
      describe('colorのみ送信',() => {
        const body = {
          color: "#ABCDEF"
        };
        let response = {};
        let dataLengthBeforPatch;
        let otherTags;
        before(done => {
          request.get(base_url).end((err,res) =>{
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
          });
          request.patch(`${base_url}/${createdData._id}/color`)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(200)が返却される', done => {
          expect(response.status).equal(200);
          done();
        });

        it('statusはtrue',done => {
          expect(response.body.status.success).equal(true);
          done();
        });

        it('送信したcolorに変更されること', done => {
          request.get(`${base_url}/${createdData._id}`).end((err,res)=>{
            expect(res.body.body.color).equal(body.color);
            done();
          });
        });

        it('別のタグが変更されないこと', done => {
          request.get(base_url).end((err,res) =>{
            const _otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
            expect(_otherTags.length === otherTags.length).equal(true);
            expect(isMatch(_otherTags,otherTags)).equal(true);
            done();
          });
        });

        it('新規タグがインサートされないこと', done => {
          request.get(base_url).end((err,res) =>{
            expect(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });
      });

      describe('labelを送信してもlabelが変更されないこと',() => {
        const body = {
          label: "別名",
          color: "#ABCDEF"
        };
        let response = {};
        let dataLengthBeforPatch;
        let otherTags;
        before(done => {
          request.get(base_url).end((err,res) =>{
            dataLengthBeforPatch = res.body.body.length;
            otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
          });
          request.patch(`${base_url}/${createdData._id}/color`)
          .send(body)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('http(200)が返却される', done => {
          expect(response.status).equal(200);
          done();
        });

        it('statusはtrue',done => {
          expect(response.body.status.success).equal(true);
          done();
        });

        it('送信したcolorに変更されること', done => {
          request.get(`${base_url}/${createdData._id}`).end((err,res)=>{
            expect(res.body.body.color).equal(body.color);
            done();
          });
        });

        it('別のタグが変更されないこと', done => {
          request.get(base_url).end((err,res) =>{
            const _otherTags = res.body.body.filter(tag => tag._id !== createdData._id);
            expect(_otherTags.length === otherTags.length).equal(true);
            expect(isMatch(_otherTags,otherTags)).equal(true);
            done();
          });
        });

        it('新規タグがインサートされないこと', done => {
          request.get(base_url).end((err,res) =>{
            expect(res.body.body.length).equal(dataLengthBeforPatch);
            done();
          });
        });

        it('labelを送信してもlabelが変更されないこと', done => {
          request.get(base_url).end((err,res) =>{
            expect(res.body.body.label).equal(sendData.label);
            done();
          });
        });

      });
    });

  });
});
