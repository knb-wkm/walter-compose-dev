import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { has,first } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/authority_files";
const login_url = "/api/login";

const request = defaults(supertest(app));
let tenant_id = "";
let file_id;
let login_user;
// テスト用のアップロードファイル(client側から送信しているPayload)
const requestPayload = {
  "dir_id":"",
  "files":[{
    "name":"text.txt",
    "size":134,
    "mime_type":"text/plain",
    "modified":1508212257000,
    "base64":"data:text/plain;base64,5pyd44Of44O844OG44Kj44Oz44Kw44Gr44Gk44GE44GmCiAgMS4gODo0NeOCiOOCiuODqeOCuOOCquS9k+aTjQogIDIuIOODqeOCuOOCquS9k+aTjee1guS6huW+jOOAgeWFqOS9k+OBuOOBrumAo+e1oQogIDMuIOalreWLmemWi+Wniwo=",
    "checksum":"028a17271a4abb1a6a82ed06f5f6cc60"
  }]};

const requestPayload2 = {
  "dir_id":"",
  "files":[{
    "name":"sample-picture.png",
    "size":7089,
    "mime_type":"image/png",
    "modified":1507611421000,
    "base64":"data:image/png;base64,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",
    "checksum":"06eb1949d043cac80fef750956845440"
  }]};


describe(base_url,() => {
  before ( done => {
    initdbPromise.then( () => {
      request.post(login_url)
        .send(authData)
        .end( (err, res) => {
          tenant_id = res.body.body.user.tenant_id;
          login_user = res.body.body.user;
          requestPayload.dir_id = res.body.body.user.tenant.home_dir_id;
          requestPayload2.dir_id = res.body.body.user.tenant.home_dir_id;
          request.set('x-auth-cloud-storage', res.body.body.token);

          // テスト用のファイルをアップロード
          request.post('/api/v1/files')
          .send(requestPayload).
          end((err,res) => {
            // ファイルアップロードの成功をチェック
            expect(res.status).equal(200);
            expect(res.body.status.success).equal(true);
            file_id = first(res.body.body)._id;
            done();
          });
        });
    });
  });

  describe('post /files',() => {

    let response;
    const url = `${base_url}/files`;
    before(done => {
      // 権限一覧を取得
      request.get('/api/v1/role_files').end((err,res) =>{
        expect(res.status).equal(200);
        // ファイル権限を追加
        request.post(`/api/v1/files/${file_id}/authorities`)
        .send({
          user: login_user,
          role: res.body.body[0]
        }).end((err,res) => {
          expect(res.status).equal(200);
          done();
        });
      });
    });

    describe('異常系',() => {
      describe('file_idが未定義',() => {
        const expected = {
          message: "ファイル権限の取得に失敗しました",
          detail: "ファイルIDが空のためファイル権限の取得に失敗しました"
        };
        describe('filesがundefind',() => {
          const sendData = {
          };
          let response;
          before(done => {
            request.post(url)
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
            expect(response.body.status.errors.files).equal(expected.detail);
            done();
        });

        });
        describe('file_idがnull',() => {
          const sendData = {
            filse:[null]
          };
          let response;
          before(done => {
            request.post(url)
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
            expect(response.body.status.errors.files).equal(expected.detail);
            done();
          });
        });
      });
      describe('file_idが配列ではない',() => {
        const expected = {
          message: "ファイル権限の取得に失敗しました",
          detail: "ファイルIDが空のためファイル権限の取得に失敗しました"
        };
        const sendData = {
          files: file_id
        };
        let response;
        before(done => {
          request.post(url)
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
          expect(response.body.status.errors.files).equal(expected.detail);
          done();
        });
      });

    });

    describe('正常系',() => {

      describe('存在しないfile_idを指定',() => {
        before(done =>{
          let body = {
            files: [ new mongoose.Types.ObjectId() ]
          };

          request.post(`${base_url}/files`)
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
        it('配列が返却される', done => {
          expect(response.body.body instanceof Array).equal(true);
          done();
        });
        it('配列は空配列である', done => {
          expect(response.body.body.length).equal(0);
          done();
        });
      });

      describe('file_idにでたらめな文字列を指定',() => {
        before(done =>{
          let body = {
            files: [ "hogehogefugafuga" ]
          };

          request.post(`${base_url}/files`)
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
        it('配列が返却される', done => {
          expect(response.body.body instanceof Array).equal(true);
          done();
        });
        it('配列は空配列である', done => {
          expect(response.body.body.length).equal(0);
          done();
        });

      });

      describe('file_idに""を指定',() => {
        before(done =>{
          let body = {
            files: [ "" ]
          };

          request.post(`${base_url}/files`)
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
        it('配列が返却される', done => {
          expect(response.body.body instanceof Array).equal(true);
          done();
        });
        it('配列は空配列である', done => {
          expect(response.body.body.length).equal(0);
          done();
        });

      });
      describe('file_idを1件のみ指定',() => {
        before(done =>{
          let body = {
            files: [ file_id ]
          };

          request.post(`${base_url}/files`)
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

        it('返却値はArrayである',done => {
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

        it('labelが含まれる', done => {
          expect(has(response.body.body[0], 'label')).equal(true);
          done();
        });

        it('labelはstringである',done => {
          expect( typeof response.body.body[0].label ).equal('string');
          done();
        });
      });

      describe('file_idを2件指定',() => {
        const url = '/api/v1/files';
        let response;
        let file_id2;
        before(done => {
          // 2つめのファイルをアップロード
          request.post(url)
          .send(requestPayload2).
          end((err,res) => {
            // ファイルアップロードの成功をチェック
            expect(res.status).equal(200);
            expect(res.body.status.success).equal(true);
            file_id2 = first(res.body.body)._id;

            let body = {
              files: [ file_id, file_id2 ]
            };

            request.post(`${base_url}/files`)
            .send(body)
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

        it('返却値はArrayである',done => {
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

        it('labelが含まれる', done => {
          expect(has(response.body.body[0], 'label')).equal(true);
          done();
        });

        it('labelはstringである',done => {
          expect( typeof response.body.body[0].label ).equal('string');
          done();
        });

      });

    });
  });

});