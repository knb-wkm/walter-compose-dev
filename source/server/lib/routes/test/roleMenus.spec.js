import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { first, has, findIndex, indexOf, isMatch } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/role_menus";
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

  describe('get /',() => {
    describe('正常系',() => {

      let response;
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

      it('statusはtrue',done => {
        expect(response.body.status.success).equal(true);
        done();
      });

      it('bodyはobjectである',done => {
        expect( typeof response.body.body ).equal('object');
        done();
      });

      it('_idが含まれる', done => {
        expect(has(response.body.body[0], '_id')).equal(true);
        done();
      });

      it('_idはObjectIdである',done => {
        expect(mongoose.Types.ObjectId.isValid(response.body.body[0]._id)).equal(true);
        done();
      });

      it('nameが含まれる', done => {
        expect(has(response.body.body[0], 'name')).equal(true);
        done();
      });

      it('nameはstringである',done => {
        expect( typeof response.body.body[0].name ).equal('string');
        done();
      });

      it('descriptionが含まれる', done => {
        expect(has(response.body.body[0], 'description')).equal(true);
        done();
      });

      it('descriptionはstringである',done => {
        expect( typeof response.body.body[0].description ).equal('string');
        done();
      });

      it('menusが含まれる', done => {
        expect(has(response.body.body[0], 'menus')).equal(true);
        done();
      });

      it('menusはobjectである',done => {
        expect( typeof response.body.body[0].menus ).equal('object');
        done();
      });

      it('menusは_idが含まれる', done => {
        expect(has(response.body.body[0].menus[0], '_id')).equal(true);
        done();
      });

      it('menusの_idはObjectIdである',done => {
        expect(mongoose.Types.ObjectId.isValid(response.body.body[0].menus[0]._id)).equal(true);
        done();
      });

      it('menusはnameが含まれる', done => {
        expect(has(response.body.body[0].menus[0], 'name')).equal(true);
        done();
      });

      it('menusのnameはstringである',done => {
        expect( typeof response.body.body[0].menus[0].name ).equal('string');
        done();
      });

      it('menusはlabelが含まれる', done => {
        expect(has(response.body.body[0].menus[0], 'label')).equal(true);
        done();
      });

      it('menusのlabelはstringである',done => {
        expect( typeof response.body.body[0].menus[0].label ).equal('string');
        done();
      });

      it('tenant_idが含まれる', done => {
        expect(has(response.body.body[0], 'tenant_id')).equal(true);
        done();
      });

      it('tenant_idはObjectIdである',done => {
        expect(mongoose.Types.ObjectId.isValid(response.body.body[0].tenant_id)).equal(true);
        done();
      });

    });
  });

  describe('post /',() => {
    describe('異常系',() => {
      describe('nameが未定義',() => {
        const expected = {
          message: "ユーザタイプの作成に失敗しました",
          detail: "ユーザタイプ名が空です"
        };
        describe('nameがundefined',() => {
          const sendData = {
            roleMenu:{}
          };
          let response;
          before(done => {
            request.post(base_url)
            .send(sendData)
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
            expect(response.body.status.errors.name).equal(expected.detail);
            done();
          });

        });

        describe('nameがnull',() => {
          const sendData = {
            roleMenu:{
              name:null
            }
          };
          let response;
          before(done => {
            request.post(base_url)
            .send(sendData)
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
            expect(response.body.status.errors.name).equal(expected.detail);
            done();
          });

        });

        describe('nameが""',() => {
          const sendData = {
            roleMenu:{
              name:""
            }
          };
          let response;
          before(done => {
            request.post(base_url)
            .send(sendData)
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
            expect(response.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
      });

      describe('nameが重複',() => {

        const expected = {
          message: "ユーザタイプの作成に失敗しました",
          detail: "そのユーザタイプ名は既に使用されています"
        };

        const sendData = {
          roleMenu:{
            name:"システム管理者"
          }
        };
        let response;

        before(done => {
          request.post(base_url)
          .send(sendData)
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
          expect(response.body.status.errors.name).equal(expected.detail);
          done();
        });

      });

      describe('nameが256文字以上',() => {

        const expected = {
          message: "ユーザタイプの作成に失敗しました",
          detail: "ユーザタイプ名が長すぎます"
        };

        const sendData = {
          roleMenu:{
            name: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
          }
        };
        let response;
        before(done => {
          request.post(base_url)
          .send(sendData)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('送信するnameのlengthが256文字以上である',done => {
          expect(sendData.roleMenu.name.length > 255).equal(true);
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
          expect(response.body.status.errors.name).equal(expected.detail);
          done();
        });

      });


      describe('descriptionが256文字以上',() => {

        const expected = {
          message: "ユーザタイプの作成に失敗しました",
          detail: "備考が長すぎます"
        };

        const sendData = {
          roleMenu:{
            name: "new ROLE",
            description: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
          }
        };
        let response;
        before(done => {
          request.post(base_url)
          .send(sendData)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });

        it('送信するdescriptionのlengthが256文字以上である',done => {
          expect(sendData.roleMenu.description.length > 255).equal(true);
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
          expect(response.body.status.errors.description).equal(expected.detail);
          done();
        });

      });
    });

    describe('正常系',() => {
      const sendData = {
        roleMenu:{
          name:"新規",
          description: "備考a@~/'\"\\"
        }
      };
      let response;
      let dataLengthBeforPost;
      before(done => {
        request.get(base_url)
        .end((err, res)=>{
          dataLengthBeforPost = res.body.body.length;
        });
        request.post(base_url)
        .send(sendData)
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


      it('レコードが一件追加されていること',done => {
        request.get(base_url)
        .end( ( err, res ) => {
          expect(res.body.body.length).equal(dataLengthBeforPost + 1);
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

  describe('get /:role_id',() => {
    describe('異常系',() => {
      describe('存在しないrole_idを指定',() => {
        const expected = {
          message: "ユーザタイプの取得に失敗しました",
          detail: "ユーザタイプが存在しません"
        };
        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          request.get(`${base_url}/${id}`).end((err,res)=>{
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
          expect(response.body.status.errors.role).equal(expected.detail);
          done();
        });

      });
      describe('role_idがでたらめな文字列を指定',() => {
        const expected = {
          message: "ユーザタイプの取得に失敗しました",
          detail: "ロールIDが不正なためユーザタイプを取得に失敗しました"
        };
        let response;
        before(done => {
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.get(`${base_url}/${id}`).end((err,res)=>{
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
          expect(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });

      });
    });
    describe('正常系',() => {
      let response;
      before(done => {
        request.get(base_url)
        .end( ( err, res ) => {
          const id = res.body.body[0]._id;
          request.get(`${base_url}/${id}`).end((err,res)=>{
            response = res;
            done();
          });
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

      it('_idが含まれる', done => {
        expect(has(response.body.body, '_id')).equal(true);
        done();
      });
      it('_idはObjectIdである',done => {
        expect(mongoose.Types.ObjectId.isValid(response.body.body._id)).equal(true);
        done();
      });
      it('nameが含まれる', done => {
        expect(has(response.body.body, 'name')).equal(true);
        done();
      });
      it('nameはstringである',done => {
        expect( typeof response.body.body.name ).equal('string');
        done();
      });
      it('descriptionが含まれる', done => {
        expect(has(response.body.body, 'description')).equal(true);
        done();
      });
      it('descriptionはstringである',done => {
        expect( typeof response.body.body.description ).equal('string');
        done();
      });
      it('tenant_idが含まれる', done => {
        expect(has(response.body.body, 'tenant_id')).equal(true);
        done();
      });
      it('tenant_idはObjectIdである',done => {
        expect(mongoose.Types.ObjectId.isValid(response.body.body.tenant_id)).equal(true);
        done();
      });
      it('menusが含まれる', done => {
        expect(has(response.body.body, 'menus')).equal(true);
        done();
      });
      it('menusはobjectである',done => {
        expect( typeof response.body.body.menus ).equal('object');
        done();
      });

      it('menusは_idが含まれる', done => {
        expect(has(response.body.body.menus[0], '_id')).equal(true);
        done();
      });

      it('menusの_idはObjectIdである',done => {
        expect(mongoose.Types.ObjectId.isValid(response.body.body.menus[0]._id)).equal(true);
        done();
      });

      it('menusはnameが含まれる', done => {
        expect(has(response.body.body.menus[0], 'name')).equal(true);
        done();
      });

      it('menusのnameはstringである',done => {
        expect( typeof response.body.body.menus[0].name ).equal('string');
        done();
      });

      it('menusはlabelが含まれる', done => {
        expect(has(response.body.body.menus[0], 'label')).equal(true);
        done();
      });

      it('menusのlabelはstringである',done => {
        expect( typeof response.body.body.menus[0].label ).equal('string');
        done();
      });

    });
  });

  describe('delete /:role_id',() => {
    // 削除対象を登録
    const sendData = {
      roleMenu:{
        name:"削除対象",
        description: "このデータはテスト用です。"
      }
    };

    let targetData;
    let dataBeforeDelete;
    before(done => {
      request.get(base_url)
      .end((err,res)=>{
        dataBeforeDelete = res.body.body;
      });
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        targetData = res.body.body;
        done();
      });
    });
    describe('異常系',() => {
      describe('存在しないrole_id',() => {
        const expected = {
          message: "ユーザタイプの削除に失敗しました",
          detail: "指定されたユーザタイプが見つからないため削除に失敗しました"
        };

        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          request.delete(`${base_url}/${id}`)
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
          expect(response.body.status.errors.role).equal(expected.detail);
          done();
        });

      });
      describe('role_idにでたらめな文字列',() => {
        const expected = {
          message: "ユーザタイプの削除に失敗しました",
          detail: "ロールIDが不正なためユーザタイプを削除に失敗しました"
        };

        let response;
        before(done => {
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.delete(`${base_url}/${id}`)
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
          expect(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });

      });
      describe('role_idがでたらめな文字列',() => {
        const expected = {
          message: "ユーザタイプの削除に失敗しました",
          detail: "ロールIDが不正なためユーザタイプを削除に失敗しました"
        };

        let response;
        before(done => {
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.delete(`${base_url}/${id}`)
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
          expect(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });

      });
    });

    describe('正常系',() => {
      let response;
      before(done => {
        request.delete(`${base_url}/${targetData._id}`)
        .end( ( err, res ) => {
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
          expect( findIndex(res.body.body, targetData) ).equal(-1);
          done();
        });
      });
      it('タグが1件のみ削除されていること',done=>{
        request.get(base_url).end((err,res)=>{
          expect(res.body.body.length).equal(dataBeforeDelete.length);
          done();
        });
      });
    });

  });

  describe('patch /:role_id/name',() => {
    const sendData = {
      roleMenu:{
        name:"name更新対象",
        description:"これはテスト用のデータです"
      }
    };
    let targetData;
    let otherDataBeforePatch;
    before(done => {
      request.get(base_url)
      .end( ( err, res ) => {
        otherDataBeforePatch = res.body.body;
      });
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        targetData = res.body.body;
        done();
      });
    });

    describe('異常系',() => {
      describe('存在しないrole_idを更新する',() => {
        const expected = {
          message: "ユーザタイプ名の変更に失敗しました",
          detail: "指定されたユーザタイプが見つからないため変更に失敗しました"
        };
        const sendData = {
          name: "更新した"
        };
        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${id}/name`)
          .send(sendData)
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
          expect(response.body.status.errors.role).equal(expected.detail);
          done();
        });

      });
      describe('role_idにでたらめな文字列を指定して更新する',() => {
        const expected = {
          message: "ユーザタイプ名の変更に失敗しました",
          detail: "ロールIDが不正なためユーザタイプ名の変更に失敗しました"
        };
        const sendData = {
          name: "更新した"
        };
        let response;
        before(done => {
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(`${base_url}/${id}/name`)
          .send(sendData)
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
          expect(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });

      });
      describe('nameが未定義',() => {
        const expected = {
          message: "ユーザタイプ名の変更に失敗しました",
          detail: "ユーザタイプ名が空です"
        };

        describe('nameがundefined', () => {
          const sendData = {
          };
          let response;
          before(done => {
            request.patch(`${base_url}/${targetData._id}/name`)
            .send(sendData)
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
            expect(response.body.status.errors.name).equal(expected.detail);
            done();
          });
        });
        describe('nameがnull', () => {
          const sendData = {
            name:null
          };
          let response;
          before(done => {
            request.patch(`${base_url}/${targetData._id}/name`)
            .send(sendData)
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
            expect(response.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
        describe('nameが""', () => {
          const sendData = {
            name:""
          };
          let response;
          before(done => {
            request.patch(`${base_url}/${targetData._id}/name`)
            .send(sendData)
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
            expect(response.body.status.errors.name).equal(expected.detail);
            done();
          });

        });
      });
      describe('nameが重複', () => {
        const expected = {
          message: "ユーザタイプ名の変更に失敗しました",
          detail: "そのユーザタイプ名は既に使用されています"
        };

        const sendData = {
          name:"システム管理者"
        };
        let response;
        before(done => {
          request.patch(`${base_url}/${targetData._id}/name`)
          .send(sendData)
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
          expect(response.body.status.errors.name).equal(expected.detail);
          done();
        });

      });
      describe('nameが256文字以上', () => {
        const expected = {
          message: "ユーザタイプ名の変更に失敗しました",
          detail: "ユーザタイプ名が長すぎます"
        };

        const sendData = {
          name:"1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
        };
        let response;
        before(done => {
          request.patch(`${base_url}/${targetData._id}/name`)
          .send(sendData)
          .end( ( err, res ) => {
            response = res;
            done();
          });
        });
        it('送信したnameが256文字以上である',done => {
          expect(sendData.name.length >= 256).equal(true);
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
          expect(response.body.status.errors.name).equal(expected.detail);
          done();
        });

      });
    });

    describe('正常系',() => {
      const sendData = {
        name: "更新した"
      };
      let response;
      before(done => {
        request.patch(`${base_url}/${targetData._id}/name`)
        .send(sendData)
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
      it('nameが送信した値に更新されていること',done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) => {
          expect(res.body.body.name).equal(sendData.name);
          done();
        });
      });
      it('descriptionが更新されていないこと', done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) => {
          expect(res.body.body.description).equal(targetData.description);
          done();
        });
      });
      it('対象以外が更新されていないこと', done => {
        request.get(base_url).end((err,res) => {
          const otherDataAfterPatch = res.body.body.filter(role => role._id !== targetData._id );
          expect(otherDataAfterPatch.length ===  otherDataBeforePatch.length).equal(true);
          expect( isMatch( otherDataAfterPatch, otherDataBeforePatch ) ).equal(true);
          done();
        });
      });
    });
  });

  describe('patch /:role_id/description',() => {
    const sendData = {
      roleMenu:{
        name:"description更新対象",
        description:"これはテスト用のデータです"
      }
    };
    let targetData;
    let otherDataBeforePatch;
    before(done => {
      request.get(base_url)
      .end( ( err, res ) => {
        otherDataBeforePatch = res.body.body;
      });
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        targetData = res.body.body;
        done();
      });
    });

    describe('異常系',() => {
      describe('存在しないrole_idを更新する',() => {
        const expected = {
          message: "備考の変更に失敗しました",
          detail: "指定されたユーザタイプが見つからないため変更に失敗しました"
        };
        const sendData = {
          description: "これはテスト用のデータです。更新されました。"
        };
        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${id}/description`)
          .send(sendData)
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
          expect(response.body.status.errors.role).equal(expected.detail);
          done();
        });

      });

      describe('role_idにでたらめな文字列指定して更新する',() => {
        const expected = {
          message: "備考の変更に失敗しました",
          detail: "ロールIDが不正なため備考の変更に失敗しました"
        };
        const sendData = {
          description: "これはテスト用のデータです。更新されました。"
        };
        let response;
        before(done => {
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(`${base_url}/${id}/description`)
          .send(sendData)
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
          expect(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });

      });
    });

    describe('正常系',() => {

      describe('descriptionのみ送信',() => {
        const sendData = {
          description: "これはテストデータです。更新されました。"
        };
        let response;
        before(done => {
          request.patch(`${base_url}/${targetData._id}/description`)
          .send(sendData)
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
        it('descriptionが送信した値に更新されていること',done => {
          request.get(`${base_url}/${targetData._id}`).end((err,res) => {
            expect(res.body.body.description).equal(sendData.description);
            done();
          });
        });
        it('nameが更新されていないこと', done => {
          request.get(`${base_url}/${targetData._id}`).end((err,res) => {
            expect(res.body.body.name).equal(targetData.name);
            done();
          });
        });
        it('対象以外が更新されていないこと', done => {
          request.get(base_url).end((err,res) => {
            const otherDataAfterPatch = res.body.body.filter(role => role._id !== targetData._id );
            expect(otherDataAfterPatch.length ===  otherDataBeforePatch.length).equal(true);
            expect( isMatch( otherDataAfterPatch, otherDataBeforePatch ) ).equal(true);
            done();
          });
        });

      });


      describe('備考が256文字以上',() => {
        const sendData = {
          description: "1234567891123456789212345678931234567894123456789512345678961234567897123456789812345678991234567890123456789112345678921234567893123456789412345678951234567896123456789712345678981234567899123456789012345678911234567892123456789312345678941234567895123456"
        };
        let response;
        before(done => {
          request.patch(`${base_url}/${targetData._id}/description`)
          .send(sendData)
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

      });

    });

  });

  describe('patch /:role_id/menus/:menu_id',() => {

    const menus_url = "/api/v1/menus";
    const sendData = {
      roleMenu:{
        name:"menus更新対象",
        description:"これはテスト用のデータです"
      }
    };
    let targetData;
    let otherDataBeforePatch;
    let menus;
    before(done => {
      request.get(base_url)
      .end( ( err, res ) => {
        otherDataBeforePatch = res.body.body;
      });
      request.get(menus_url).end((err,res) => {
        menus = res.body.body;
      });
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        targetData = res.body.body;
        done();
      });
    });

    describe('異常系',() => {
      describe('存在しないrole_idを更新する',() => {
        const expected = {
          message: "メニューの追加に失敗しました",
          detail: "指定されたユーザタイプが見つからないためメニューの追加に失敗しました"
        };
        let response;
        before(done => {
          const menu = first(menus);
          const id = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${id}/menus/${menu._id}`)
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
          expect(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });

      describe('role_idにでたらめな文字列を指定して更新する',() => {
        const expected = {
          message: "メニューの追加に失敗しました",
          detail: "ロールIDが不正なためメニューの追加に失敗しました"
        };
        let response;
        before(done => {
          const menu = first(menus);
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(`${base_url}/${id}/menus/${menu._id}`)
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
          expect(response.body.status.errors.role_id).equal(expected.detail);
          done();
        });
      });

      describe('存在しないmenuを登録する',() => {
        const expected = {
          message: "メニューの追加に失敗しました",
          detail: "指定されたメニューが見つからないため追加に失敗しました"
        };
        let response;
        before(done => {
          const menu = first(menus);
          const id = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${targetData._id}/menus/${id}`)
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
          expect(response.body.status.errors.menu).equal(expected.detail);
          done();
        });
      });
      describe('既に登録されているmenuを登録する',() => {
        const expected = {
          message: "メニューの追加に失敗しました",
          detail: "指定されたメニューが既に登録されているため追加に失敗しました"
        };
        let response;
        before(done => {
          const menu = first(menus);
          const url = `${base_url}/${targetData._id}/menus/${menu._id}`;
          request.patch(url).end( ( err, res ) => {
            request.patch(url).end( ( err, res ) => {
              response = res;
              done();
            });
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
          expect(response.body.status.errors.menu).equal(expected.detail);
          done();
        });
      });

    });
    describe('正常系',() => {
      let response;
      let dataBeforePatch;
      let targetMenu;
      before(done => {
        targetMenu = menus[1];
        request.get(`${base_url}/${targetData._id}`).end((err, res)=>{
          dataBeforePatch = res.body.body;
        });
        request.patch(`${base_url}/${targetData._id}/menus/${targetMenu._id}`)
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

      it('対象のメニューが追加されていること', done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) =>{
          const menus = res.body.body.menus;
          expect( findIndex(menus, targetMenu) >= 0 ).equal(true);
          done();
        });
      });

      it('対象以外のmenuが追加されていないこと', done => {
        request.get(`${base_url}/${targetData._id}`).end((err, res)=>{
          const patchedMenus = res.body.body.menus.filter(menu => menu._id !== targetMenu._id );
          expect(isMatch( patchedMenus, dataBeforePatch.menus )).equal(true);
          done();
        });
      });

      it('nameが更新されていないこと', done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) => {
          expect(res.body.body.name).equal(targetData.name);
          done();
        });
      });

      it('descriptionが更新されていないこと', done => {
         request.get(`${base_url}/${targetData._id}`).end((err,res) => {
          expect(res.body.body.description).equal(targetData.description);
          done();
        });
      });

      it('対象以外のroleMenuが更新されていないこと', done => {
        request.get(base_url).end((err,res) => {
          const otherDataAfterPatch = res.body.body.filter(role => role._id !== targetData._id );
          expect(otherDataAfterPatch.length ===  otherDataBeforePatch.length).equal(true);
          expect( isMatch( otherDataAfterPatch, otherDataBeforePatch ) ).equal(true);
          done();
        });
      });
    });
  });

  describe('delete /:role_id/menus/:menu_id',() => {

    const menus_url = "/api/v1/menus";
    const sendData = {
      roleMenu:{
        name:"menus削除対象",
        description:"これはテスト用のデータです"
      }
    };
    let targetData;
    let otherDataBeforePatch;
    let menus;
    let targetMenu;
    before(done => {
      request.get(base_url)
      .end( ( err, res ) => {
        otherDataBeforePatch = res.body.body;
      });
      request.get(menus_url).end((err,res) => {
        menus = res.body.body;
        targetMenu = first(menus);
      });
      request.post(base_url)
      .send(sendData)
      .end( ( err, res ) => {
        targetData = res.body.body;
        request.patch(`${base_url}/${targetData._id}/menus/${targetMenu._id}`).end((err,res) =>{
          // テストデータが想定通りに作成できていることを確認
          expect(res.body.body.name === sendData.roleMenu.name).equal(true);
          expect(res.body.body.description === sendData.roleMenu.description ).equal(true);
          expect( indexOf(res.body.body.menus,targetMenu._id) >= 0 ).equal(true);
          done();
        });
      });
    });

    describe('異常系',() => {
      describe('存在しないrole_idを更新する',() => {
        const expected = {
          message: "メニューの削除に失敗しました",
          detail: "指定されたユーザタイプが見つからないためメニューの削除に失敗しました"
        };
        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          request.delete(`${base_url}/${id}/menus/${targetMenu._id}`)
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
          expect(response.body.status.errors.role).equal(expected.detail);
          done();
        });
      });
      describe('存在しないmenuを削除する',() => {
        const expected = {
          message: "メニューの削除に失敗しました",
          detail: "指定されたメニューが見つからないため削除に失敗しました"
        };
        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          request.delete(`${base_url}/${targetData._id}/menus/${id}`)
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
          expect(response.body.status.errors.menu).equal(expected.detail);
          done();
        });
      });
      describe('登録されていないmenuを削除する',() => {
        const expected = {
          message: "メニューの削除に失敗しました",
          detail: "指定されたメニューは登録されていないため削除に失敗しました"
        };
        let response;
        before(done => {
          const id = menus[1]._id;
          expect(id !== targetMenu._id).equal(true); // 登録したメニューと異なることを担保
          request.delete(`${base_url}/${targetData._id}/menus/${id}`)
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
          expect(response.body.status.errors.menu).equal(expected.detail);
          done();
        });
      });
    });

    describe('正常系',() => {
      let response;
      let dataBeforePatch;
      before(done => {
        request.get(`${base_url}/${targetData._id}`).end((err, res)=>{
          dataBeforePatch = res.body.body;
        });
        request.delete(`${base_url}/${targetData._id}/menus/${targetMenu._id}`)
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

      it('対象のメニューが削除されていること', done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) =>{
          const menus = res.body.body.menus;
          expect( isMatch(menus, targetMenu) ).equal(false);
          done();
        });
      });

      it('nameが更新されていないこと', done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) => {
          expect(res.body.body.name).equal(targetData.name);
          done();
        });
      });

      it('descriptionが更新されていないこと', done => {
         request.get(`${base_url}/${targetData._id}`).end((err,res) => {
          expect(res.body.body.description).equal(targetData.description);
          done();
        });
      });

      it('対象以外のroleMenuが更新されていないこと', done => {
        request.get(base_url).end((err,res) => {
          const otherDataAfterPatch = res.body.body.filter(role => role._id !== targetData._id );
          expect(otherDataAfterPatch.length ===  otherDataBeforePatch.length).equal(true);
          expect( isMatch( otherDataAfterPatch, otherDataBeforePatch ) ).equal(true);
          done();
        });
      });
    });

  });
});
