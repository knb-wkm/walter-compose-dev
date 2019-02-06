import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { has, first, findIndex, isMatch } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/role_files";
const login_url = "/api/login";
let tenant_id;
const request = defaults(supertest(app));

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
      const url = `${base_url}`;
      let response;
      before(done => {
        request.get(url)
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
      it('actionsが含まれる', done => {
        expect(has(response.body.body[0], 'actions')).equal(true);
        done();
      });
      it('actionsはobjectである',done => {
        expect( typeof response.body.body[0].actions ).equal('object');
        done();
      });
      it('actionsにはlabelが含まれる', done => {
        expect(has(response.body.body[0].actions[0], 'label')).equal(true);
        done();
      });
      it('labelはstringである',done => {
        expect( typeof response.body.body[0].actions[0].label ).equal('string');
        done();
      });
      it('actionsにはnameが含まれる', done => {
        expect(has(response.body.body[0].actions[0], 'name')).equal(true);
        done();
      });
      it('nameはstringである',done => {
        expect( typeof response.body.body[0].actions[0].name ).equal('string');
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
          message: "ロールの作成に失敗しました",
          detail: "ロール名が空です"
        };
        describe('nameがundefined',() => {
          const sendData = {
            role:{
              description: "test data"
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
        describe('nameがnull',() => {
          const sendData = {
            role:{
              name:null,
              description: "test data"
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
            role:{
              name: "",
              description: "test data"
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
          message: "ロールの作成に失敗しました",
          detail: "そのロール名は既に使用されています"
        };
        const sendData = {
          role:{
            name: "重複"
          }
        };
        let response;
        before(done => {
          request.post(base_url)
          .send(sendData)
          .end( ( err, res ) => {
            request.post(base_url)
            .send(sendData)
            .end( ( err, res ) => {
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
          expect(response.body.status.errors.name).equal(expected.detail);
          done();
        });
      });
      describe('nameが256文字以上',() => {
        const expected = {
          message: "ロールの作成に失敗しました",
          detail: "ロール名が長すぎます"
        };
        const sendData = {
          role : {
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
        it('送信したnameは256文字以上である',done => {
          expect( sendData.role.name.length >= 256 ).equal(true);
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
          message: "ロールの作成に失敗しました",
          detail: "備考が長すぎます"
        };
        const sendData = {
          role: {
            name:"備考が長過ぎる",
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
        it('送信したdescriptionは256文字以上である',done => {
          expect( sendData.role.description.length >= 256 ).equal(true);
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
        role:{
          name: "新規",
          description: "これはテスト用データです"
        }
      };
      let response;
      let dataBeforePost;
      before(done => {
        request.get(base_url).end((err, res) => {
          dataBeforePost = res.body.body;

          request.post(base_url)
          .send(sendData)
          .end( ( err, res ) => {
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
      it('レコードが一件削除されていること',done => {
        request.get(base_url)
        .end( ( err, res ) => {
          expect(res.body.body.length).equal(dataBeforePost.length + 1);
          done();
        });

      });
      it('送信した内容でロールが削除されていること',done => {
        request.get(base_url)
        .end( ( err, res ) => {
          expect( findIndex(res.body.body, sendData.role) ).not.equal(-1);
          done();
        });
      });

   });
  });

  describe('get /:role_id',() => {
    describe('異常系',() => {
      describe('存在しないrole_idを指定',() => {
        const expected = {
          message: "ロールの取得に失敗しました",
          detail: "指定されたロールが存在しないためロールの取得に失敗しました"
        };
        let response;
        before(done => {
          const role_id = new mongoose.Types.ObjectId();
          const url = `${base_url}/${role_id}`;
          request.get(url)
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
      describe('role_idにでたらめな文字列を指定',() => {
        const expected = {
          message: "ロールの取得に失敗しました",
          detail: "ロールIDが不正なためロールの取得に失敗しました"
        };
        let response;
        before(done => {
          const role_id = "hogehogefugafuga";
          const url = `${base_url}/${role_id}`;
          request.get(url)
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

    });
  });

  describe('delete /:role_id',() => {
    // 削除対象を登録
    const sendData = {
      role:{
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
          message: "ロールの削除に失敗しました",
          detail: "指定されたロールが見つからないため削除に失敗しました"
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
          message: "ロールの削除に失敗しました",
          detail: "ロールIDが不正なため削除に失敗しました"
        };

        let response;
        before(done => {
          const id = "hoawjfheioahfoiwefhfaf";
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
    });
    describe('正常系',() => {
      let response;
      before(done => {
        const id = targetData._id;
        request.delete(`${base_url}/${id}`)
        .end( ( err, res ) => {
          response = res;
          done();
        });
      });
      it('http(200)が返却される', done => {
        expect(response.status).equal(200);
        done();
      });
      it('送信したidのロールが削除されている', done => {
        request.get(base_url).end((err,res)=>{
          expect( findIndex(res.body.body, targetData) ).equal(-1);
          done();
        });
      });
      it('ロールが1件のみ削除されていること',done=>{
        request.get(base_url).end((err,res)=>{
          expect(res.body.body.length).equal(dataBeforeDelete.length);
          done();
        });
      });
    });
  });

  describe('patch /:role_id/name',() => {
    const sendData = {
      role:{
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
          message: "ロール名の変更に失敗しました",
          detail: "指定されたロールが見つからないため変更に失敗しました"
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
          message: "ロール名の変更に失敗しました",
          detail: "ロールIDが不正なためロール名の変更に失敗しました"
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
          message: "ロール名の変更に失敗しました",
          detail: "ロール名が空です"
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
          message: "ロール名の変更に失敗しました",
          detail: "そのロール名は既に使用されています"
        };

        const sendData = {
          name:"読み取りのみ"
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
          message: "ロール名の変更に失敗しました",
          detail: "ロール名が長すぎます"
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
      role:{
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
          detail: "指定されたロールが見つからないため備考の変更に失敗しました"
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

  describe('patch /:role_id/actions/:action_id',() => {

    const actions_url = "/api/v1/actions";
    const sendData = {
      role:{
        name:"actions更新対象",
        description:"これはテスト用のデータです"
      }
    };
    let targetData;
    let otherDataBeforePatch;
    let actions;
    before(done => {
      // 実行前のデータを取得
      request.get(base_url)
      .end( ( err, res ) => {
        otherDataBeforePatch = res.body.body;

        // actionsを取得
        request.get(actions_url).end((err,res) => {
          actions = res.body.body;

          // テスト用データ登録
          request.post(base_url)
          .send(sendData)
          .end( ( err, res ) => {
            targetData = res.body.body;
            done();
          });
        });
      });
    });

    describe('異常系',() => {

      describe('存在しないrole_idを更新する',() => {
        const expected = {
          message: "アクションの追加に失敗しました",
          detail: "指定されたロールが見つからないためアクションの追加に失敗しました"
        };
        let response;
        before(done => {
          const action = first(actions);
          const id = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${id}/actions/${action._id}`)
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
          message: "アクションの追加に失敗しました",
          detail: "ロールIDが不正なためアクションの追加に失敗しました"
        };
        let response;
        before(done => {
          const action = first(actions);
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.patch(`${base_url}/${id}/actions/${action._id}`)
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

      describe('存在しないactionを登録する',() => {
        const expected = {
          message: "アクションの追加に失敗しました",
          detail: "指定されたアクションが見つからないため追加に失敗しました"
        };
        let response;
        before(done => {
          const action = first(actions);
          const id = new mongoose.Types.ObjectId();
          request.patch(`${base_url}/${targetData._id}/actions/${id}`)
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
          expect(response.body.status.errors.action).equal(expected.detail);
          done();
        });
      });

      describe('action_idにでたらめな文字列を指定する',() => {
        const expected = {
          message: "アクションの追加に失敗しました",
          detail: "アクションIDが不正なためアクションの追加に失敗しました"
        };
        let response;
        before(done => {
          const id = "jfoaddfjaoieghaowhefofhjaowejwadj";
          request.patch(`${base_url}/${targetData._id}/actions/${id}`)
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
          expect(response.body.status.errors.action_id).equal(expected.detail);
          done();
        });
      });

      describe('既に登録されているactionを登録する',() => {
        const expected = {
          message: "アクションの追加に失敗しました",
          detail: "指定されたアクションが既に登録されているため追加に失敗しました"
        };
        let response;
        before(done => {
          const action = first(actions);
          const url = `${base_url}/${targetData._id}/actions/${action._id}`;
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
          expect(response.body.status.errors.action).equal(expected.detail);
          done();
        });
      });

    });

    describe('正常系',() => {
      let response;
      let dataBeforePatch;
      let targetAction;
      before(done => {
        targetAction = actions[1];
        request.get(`${base_url}/${targetData._id}`).end((err, res)=>{
          dataBeforePatch = res.body.body;
        });
        request.patch(`${base_url}/${targetData._id}/actions/${targetAction._id}`)
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

      it('対象のアクションが追加されていること', done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) =>{
          const actions = res.body.body.actions;
          expect( findIndex(actions, targetAction) >= 0 ).equal(true);
          done();
        });
      });

      it('対象以外のactionが追加されていないこと', done => {
        request.get(`${base_url}/${targetData._id}`).end((err, res)=>{
          const patchedMenus = res.body.body.actions.filter(action => action._id !== targetAction._id );
          expect(isMatch( patchedMenus, dataBeforePatch.actions )).equal(true);
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

      it('対象以外のroleFileが更新されていないこと', done => {
        request.get(base_url).end((err,res) => {
          const otherDataAfterPatch = res.body.body.filter(role => role._id !== targetData._id );
          expect(otherDataAfterPatch.length ===  otherDataBeforePatch.length).equal(true);
          expect( isMatch( otherDataAfterPatch, otherDataBeforePatch ) ).equal(true);
          done();
        });
      });
    });
  });

  describe('delete /:role_id/actions/:action_id',() => {

    const actions_url = "/api/v1/actions";
    const sendData = {
      role:{
        name:"actions削除対象",
        description:"これはテスト用のデータです"
      }
    };
    let targetData;
    let targetAction;
    let otherDataBeforePatch;
    let actions;
    let action_id;
    before(done => {
      // 実行前のデータを取得
      request.get(base_url)
      .end( ( err, res ) => {
        otherDataBeforePatch = res.body.body;

        // actionsを取得
        request.get(actions_url).end((err,res) => {
          actions = res.body.body;

          // テスト用データ登録
          request.post(base_url)
          .send(sendData)
          .end( ( err, res ) => {
            targetData = res.body.body;
            // actionsを登録
            targetAction = first(actions);
            action_id = first(actions)._id;
            request.patch(`${base_url}/${targetData._id}/actions/${action_id}`).end((err,res)=>{
              done();
            });
          });
        });
      });
    });
    describe('異常系',() => {

      describe('存在しないrole_idを更新する',() => {
        const expected = {
          message: "アクションの削除に失敗しました",
          detail: "指定されたロールが存在しないため削除に失敗しました"
        };
        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          request.delete(`${base_url}/${id}/actions/${action_id}`)
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
          message: "アクションの削除に失敗しました",
          detail: "ロールIDが不正なためアクションの削除に失敗しました"
        };
        let response;
        before(done => {
          const action = first(actions);
          const id = "asfjapfjioeawfjoejwafojfoeawjfiaoefw";
          request.delete(`${base_url}/${id}/actions/${action._id}`)
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

      describe('存在しないactionを登録する',() => {
        const expected = {
          message: "アクションの削除に失敗しました",
          detail: "指定されたアクションが存在しないため削除に失敗しました"
        };
        let response;
        before(done => {
          const action = first(actions);
          const id = new mongoose.Types.ObjectId();
          request.delete(`${base_url}/${targetData._id}/actions/${id}`)
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
          expect(response.body.status.errors.action).equal(expected.detail);
          done();
        });
      });

      describe('action_idにでたらめな文字列を指定する',() => {
        const expected = {
          message: "アクションの削除に失敗しました",
          detail: "アクションIDが不正なためアクションの削除に失敗しました"
        };
        let response;
        before(done => {
          const id = "jfoaddfjaoieghaowhefofhjaowejwadj";
          request.delete(`${base_url}/${targetData._id}/actions/${id}`)
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
          expect(response.body.status.errors.action_id).equal(expected.detail);
          done();
        });
      });

      describe('登録されていないactionを削除する',() => {
        const expected = {
          message: "アクションの削除に失敗しました",
          detail: "指定されたアクションは登録されていないため削除に失敗しました"
        };
        let response;
        before(done => {
          const id = actions[1]._id;
          expect(id !== action_id).equal(true); // 登録したアクションと異なることを担保
          request.delete(`${base_url}/${targetData._id}/actions/${id}`)
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
          expect(response.body.status.errors.action).equal(expected.detail);
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

          request.delete(`${base_url}/${targetData._id}/actions/${action_id}`)
          .end( ( err, res ) => {
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

      it('対象のアクションが削除されていること', done => {
        request.get(`${base_url}/${targetData._id}`).end((err,res) =>{
          const actions = res.body.body.actions;
          expect( isMatch(actions, targetAction) ).equal(false);
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

      it('対象以外のroleFileが更新されていないこと', done => {
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
