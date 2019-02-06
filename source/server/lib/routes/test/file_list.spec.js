import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { first, has, chain, find } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

// model
import User from "../../models/User";
import { resolve } from "url";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/files";
const login_url = "/api/login";

const request = defaults(supertest(app));
var user;
var meta_infos;

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
  }]
};

describe(base_url,() => {
  before ( done => {
    try {
      initdbPromise.then( () => {
        request.post(login_url)
          .send(authData)
          .end( (err, res) => {
            user = res.body.body.user;
            request.set('x-auth-cloud-storage', res.body.body.token);
            done();
          });
      });
    } catch (e) {
      console.log(e);
      done();
    }
  });

  describe('get /',() => {
    let file_id;
    before( done => {
      try{
        new Promise((resolve,reject)=>{
          // テスト用のファイルをアップロード
          request.post('/api/v1/files')
          .send(requestPayload).
          end((err,res) => {
            // ファイルアップロードの成功をチェック
            expect(res.status).equal(200);
            expect(res.body.status.success).equal(true);
            file_id = first(res.body.body)._id;
            resolve(res);
          });

        }).then( res => {
            // タグ一覧を取得
            return new Promise((resolve, reject)=>{
              request.get("/api/v1/tags").end((err,res)=>{
                resolve(res);
              });
            });
        }).then( res => {
          const tags = first(res.body.body);
          return new Promise((resolve, reject)=>{
            // ファイルに先頭のタグ追加
            request.post(`${base_url}/${file_id}/tags`)
            .send(tags).end((err,res) => {
              resolve(res);
            });
          });
        }).then( res => {
          // メタ情報一覧を取得
          return new Promise((resolve, reject)=>{
            request.get('/api/v1/meta_infos').end((err,res) => {
              resolve(res);
            });
          });
        }).then( res => {
          // ファイルに先頭のメタ情報を追加
          meta_infos = find(res.body.body, {name: 'display_file_name'});
          const meta = {
            meta: meta_infos,
            value: "meta_value"
          };
          return new Promise((resolve, reject)=>{
            request.post(`${base_url}/${file_id}/meta`).send(meta).end((err,res) => {
              resolve(res);
            });
          });
        }).then( res => {
          done();
        });
      }catch(e){
        console.log(e);
        done();
      }
    });

    describe('異常系',() => {
      describe('dir_idが不正',() => {
        const expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "指定されたフォルダが存在しないためファイル一覧の取得に失敗しました"
        };
        describe('dir_idが存在しないObjectId', () => {
          let response;
          before(done => {
            const id = new mongoose.Types.ObjectId().toString();
            request.get(`${base_url}`)
            .query({dir_id:id})
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
            expect(response.body.status.errors.dir_id).equal(expected.detail);
            done();
          });
        });
        describe('dir_idが意図しない文字列', () => {
          let response;
          before(done => {
            const id = 'jlasjfafewlajfklejflawfkealf';
            request.get(`${base_url}`)
            .query({dir_id:id})
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
            expect(response.body.status.errors.dir_id).equal(expected.detail);
            done();
          });
        });
      });
      describe('閲覧権限のないdir_id',() => {
          const expected = {
            message: "ファイル一覧の取得に失敗しました",
            detail: "閲覧権限が無いためファイル一覧の取得に失敗しました"
          };
          let response;
          let dir_id;
          before(done=>{
            // フォルダを新規作成
            const create_dir_body = {dir_id:user.tenant.home_dir_id, dir_name:"新しいフォルダ" };
            // フォルダを作成
            new Promise((resolve, reject) => {
              request.post('/api/v1/dirs')
              .send(create_dir_body).
              end((err,res) => {
                setTimeout(() => {
                  resolve(res);
                }, 2000);
              });
            }).then(res => {
              // 作成したフォルダのIDを取得
              return new Promise((resolve,reject)=>{
                request.get(`/api/v1/files`).end((err,res) => {
                  const create_dir = res.body.body.filter(file => (file.name === create_dir_body.dir_name) );
                  dir_id = first(create_dir)._id;
                  resolve(create_dir);
                });
              });

            }).then(res => {
              // 別ユーザでログイン
              const new_auth_data = {
                account_name: "hanako",
                name: "hanako",
                email: "hanako",
                password: "test"
              };
              return new Promise((resolve, reject) =>{
                request.post(login_url).send(new_auth_data).end( (err, res) => {
                  request.set('x-auth-cloud-storage', res.body.body.token);
                  resolve(res);
                });
              });
            }).then(res => {
              return new Promise((resolve, reject) =>{
                // 作成したフォルダに対してリストを取得する
                request.get(`${base_url}`)
                .query({dir_id:dir_id})
                .end( ( err, res ) => {
                  response = res;
                  resolve(res);
                });
              });
            }).then(res => {
              done();
            });
          });

          after(done => {
            request.post(login_url).send(authData).end( (err, res) => {
              request.set('x-auth-cloud-storage', res.body.body.token);
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
            expect(response.body.status.errors.dir_id).equal(expected.detail);
            done();
          });

      });

      describe('pageが不正',() => {
        const expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "pageが数字では無いためファイル一覧の取得に失敗しました"
        };
        describe('pageが""', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ page: "" })
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
            expect(response.body.status.errors.page).equal(expected.detail);
            done();
          });
        });
        describe('pageが不正文字列', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ page: '\/:*?<>|' })
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
            expect(response.body.status.errors.page).equal(expected.detail);
            done();
          });
        });
        describe('pageが数字以外の文字列', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ page: 'ichi' })
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
            expect(response.body.status.errors.page).equal(expected.detail);
            done();
          });
        });
      });
      describe('ソート条件が不正',() => {
        const expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "ソート条件が不正なためファイル一覧の取得に失敗しました"
        };
        describe('sortが""', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ sort: '' })
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
            expect(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('sortが不正な文字列', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ sort: '\/:*?<>|' })
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
            expect(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('sortが意図しない文字列', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ sort: 'ichi' })
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
            expect(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('orderが""', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ order: "" })
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
            expect(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('orderが不正文字列', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ order: '\/:*?<>|' })
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
            expect(response.body.status.errors.sort).equal(expected.detail);
            done();
          });
        });
        describe('orderが意図しない文字列', () => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ order: 'koujun' })
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
            expect(response.body.status.errors.sort).equal(expected.detail);
            done();
          });;
        });
      });

    });

    describe('正常系',() => {
      describe('ファイルが0件の場合',() => {
        let response;
        before(done => {
          new Promise((resolve, reject) =>{
            request.get(base_url)
            .end( ( err, res ) => {
              resolve(res);
            });
          }).then(res =>{
            if( res.body.body.length > 0 ){
              return new Promise((resolve,reject) => {
                res.body.body.map(file =>{
                  return request.delete(`${base_url}/${file._id}`).end((err,res) => res );
                });
                setTimeout(() => {
                  resolve();
                }, 2000);
              });
            }
          }).then(res =>{
            return new Promise((resolve,reject) => {
              request.get(base_url)
              .end( ( err, res ) => {
                response = res;
                resolve(res);
              });
            });
          }).then(res =>{
            done();
          });
        });


        after( done => {
          new Promise((resolve,reject)=>{
            // テスト用のファイルをアップロード
            request.post('/api/v1/files')
            .send(requestPayload).
            end((err,res) => {
              // ファイルアップロードの成功をチェック
              expect(res.status).equal(200);
              expect(res.body.status.success).equal(true);
              file_id = first(res.body.body)._id;
              setTimeout(() => {
                resolve(res);
              }, 2000);
            });

          }).then( res => {
              // タグ一覧を取得
              return new Promise((resolve, reject)=>{
                request.get("/api/v1/tags").end((err,res)=>{
                  resolve(res);
                });
              });
          }).then( res => {
            const tags = first(res.body.body);
            return new Promise((resolve, reject)=>{
              // ファイルに先頭のタグ追加
              request.post(`${base_url}/${file_id}/tags`)
              .send(tags).end((err,res) => {
                resolve(res);
              });
            });
          }).then( res => {
            // メタ情報一覧を取得
            return new Promise((resolve, reject)=>{
              request.get('/api/v1/meta_infos').end((err,res) => {
                resolve(res);
              });
            });
          }).then( res => {
            // ファイルに先頭のメタ情報を追加
            const meta = {
              meta: first(res.body.body),
              value: "meta_value"
            };
            return new Promise((resolve, reject)=>{
              request.post(`${base_url}/${file_id}/meta`).send(meta).end((err,res) => {
                resolve(res);
              });
            });
          }).then( res => {
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

        it('返却値は配列', done =>{
          expect( response.body.body instanceof Array ).equal(true);
          done();
        });

        it('返却値のlengthは0', done => {
          expect( response.body.body.length ).equal(0);
          done();
        });

      });
      describe('ファイルが1件以上登録されている',() => {
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

        it('返却値はArrayである',done => {
          expect( response.body.body instanceof Array ).equal(true);
          done();
        });

        it('_idが含まれる', done => {
          expect( chain(response.body.body).first().has('_id').value() ).equal(true);
          done();
        });

        it('_idはObjectIdである',done => {
          expect(mongoose.Types.ObjectId.isValid(first(response.body.body)._id)).equal(true);
          done();
        });

        it('nameが含まれる', done => {
          expect(chain(response.body.body).first().has('name').value()).equal(true);
          done();
        });

        it('nameはstringである',done => {
          expect( typeof first(response.body.body).name ).equal('string');
          done();
        });

        it('mime_typeが含まれる', done => {
          expect( chain(response.body.body).first().has('mime_type').value() ).equal(true);
          done();
        });

        it('mime_typeはstringである',done => {
          expect( typeof first(response.body.body).mime_type ).equal('string');
          done();
        });

        it('sizeが含まれる', done => {
          expect( chain(response.body.body).first().has('size').value() ).equal(true);
          done();
        });

        it('sizeはnumberである',done => {
          expect( typeof first(response.body.body).size ).equal('number');
          done();
        });

        it('is_dirが含まれる', done => {
          expect( chain(response.body.body).first().has('is_dir').value() ).equal(true);
          done();
        });

        it('is_dirはbooleanである',done => {
          expect( typeof first(response.body.body).is_dir ).equal('boolean');
          done();
        });

        it('dir_idが含まれる', done => {
          expect( chain(response.body.body).first().has('dir_id').value() ).equal(true);
          done();
        });

        it('dir_idはObjectIdである',done => {
          expect(mongoose.Types.ObjectId.isValid(first(response.body.body).dir_id)).equal(true);
          done();
        });

        it('is_displayが含まれる', done => {
          expect( chain(response.body.body).first().has('is_display').value() ).equal(true);
          done();
        });

        it('is_displayはbooleanである',done => {
          expect( typeof first(response.body.body).is_display ).equal('boolean');
          done();
        });

        it('is_starが含まれる', done => {
          expect( chain(response.body.body).first().has('is_star').value() ).equal(true);
          done();
        });

        it('is_starはbooleanである',done => {
          expect( typeof first(response.body.body).is_star ).equal('boolean');
          done();
        });

        it('is_cryptedが含まれる', done => {
          expect( chain(response.body.body).first().has('is_crypted').value() ).equal(true);
          done();
        });

        it('is_cryptedはbooleanである',done => {
          expect( typeof first(response.body.body).is_crypted ).equal('boolean');
          done();
        });

        it('historiesが含まれる', done => {
          expect( chain(response.body.body).first().has('histories').value() ).equal(true);
          done();
        });

        it('historiesはArrayである',done => {
          expect( first(response.body.body).histories instanceof Array ).equal(true);
          done();
        });

        it('historiesはbodyを持つ', done => {
          const histories = first(response.body.body).histories;
          expect(has( first(histories), 'body')).equal(true);
          done();
        });
        it('historiesはactionを持つ', done => {
          const histories = first(response.body.body).histories;
          expect(has( first(histories), 'action')).equal(true);
          done();
        });
        it('histories.actionはstringである',done => {
          const histories = first(response.body.body).histories;
          expect( typeof first(histories).action ).equal('string');
          done();
        });
        it('historiesはuserを持つ', done => {
          const histories = first(response.body.body).histories;
          expect(has( first(histories), 'user')).equal(true);
          done();
        });
        it('historiesのuserはobjectである',done => {
          const histories = first(response.body.body).histories;
          expect( typeof first(histories).user ).equal('object');
          done();
        });

        it("historiesのuserには_id,account_name,name,email,password,enabled,tenant_id,groups,typeが含まれている", done => {
          const histories = first(response.body.body).histories;
          const needle = ["_id", "account_name", "name", "email", "password", "enabled", "tenant_id", "groups", "type"];
          expect(
            chain( first( histories ).user ).pick(needle).keys().value().length === needle.length
          ).equal(true);

          done();
        });

        it('historiesはmodifiedを持つ', done => {
          const histories = first(response.body.body).histories;
          expect(has( first(histories), 'modified')).equal(true);
          done();
        });
        it('histories.modifiedはstringである',done => {
          const histories = first(response.body.body).histories;
          expect( typeof first(histories).modified ).equal('string');
          done();
        });

        it('tagsが含まれる', done => {
          expect( chain(response.body.body).first().has('tags').value() ).equal(true);
          done();
        });

        it('tagsはArrayである',done => {
          expect( first(response.body.body).tags instanceof Array ).equal(true);
          done();
        });

        it('tagsには_id,color,label,tenant_idが含まれている', done => {
          const needle = [ "_id", "color", "label", "tenant_id"];
          expect(
            chain( first(response.body.body).tags ).first().pick(needle).keys().value().length === needle.length
          ).equal(true);
          done();
        });

        it('is_deletedが含まれる', done => {
          expect( chain(response.body.body).first().has('is_deleted').value() ).equal(true);
          done();
        });

        it('is_deletedはbooleanである',done => {
          expect( typeof first(response.body.body).is_deleted ).equal('boolean');
          done();
        });

        it('modifiedが含まれる', done => {
          expect( chain(response.body.body).first().has('modified').value() ).equal(true);
          done();
        });

        it('modifiedはstringである',done => {
          expect( typeof first(response.body.body).modified ).equal('string');
          done();
        });

        it('preview_idが含まれる', done => {
          expect( chain(response.body.body).first().has('preview_id').value() ).equal(true);
          done();
        });

        it('preview_idはnullまたはObjectIdである',done => {
          if(first(response.body.body).preview_id === null){
            expect(first(response.body.body).preview_id).equal(null);
          }else{
            expect(mongoose.Types.ObjectId.isValid(first(response.body.body).preview_id)).equal(true);
          }
          done();
        });

        it('authoritiesが含まれる', done => {
          expect( chain(response.body.body).first().has('authorities').value() ).equal(true);
          done();
        });

        it('authoritiesはArrayである',done => {
          expect( first(response.body.body).authorities instanceof Array ).equal(true);
          done();
        });

        it('authorities[0]にはrole_files, users, actionsが含まれている', done => {
          const needle = ["role_files", "users", "actions"];
          expect(
            chain( first(response.body.body).authorities ).first().pick(needle).keys().value().length === needle.length
          ).equal(true);
          done();
        });

        it('authorities[0].actionsには_id,name,labelが含まれている', done => {
          const authorities = first(response.body.body).authorities;
          const needle = ["_id", "name", "label"];
          expect(
            chain( first(authorities).actions ).first().pick(needle).keys().value().length === needle.length
          ).equal(true);
          done();
        });

        it('dirsが含まれる', done => {
          expect( chain(response.body.body).first().has('dirs').value() ).equal(true);
          done();
        });

        it('dirsはArrayである',done => {
          expect( first(response.body.body).dirs instanceof Array ).equal(true);
          done();
        });

        it('dirsには_id,ancestor,descendant,depthが含まれている', done => {
          const needle = ["_id", "ancestor", "descendant", "depth"];
          expect(
            chain( first(response.body.body).dirs ).first().pick(needle).keys().value().length === needle.length
          ).equal(true);
          done();
        });

        it('meta_infosが含まれる', done => {
          expect( chain(response.body.body).first().has('meta_infos').value() ).equal(true);
          done();
        });

        it('meta_infosはArrayである',done => {
          expect( first(response.body.body).meta_infos instanceof Array ).equal(true);
          done();
        });

        it('meta_infosには_id,label,value_type,valueが含まれている', done => {
          const needle = ["_id", "label", "value_type", "value"];
          expect(
            chain( first(response.body.body).meta_infos ).first().pick(needle).keys().value().length === needle.length
          ).equal(true);
          done();
        });

        it('actionsが含まれる', done => {
          expect( chain(response.body.body).first().has('actions').value() ).equal(true);
          done();
        });

        it('actionsはArrayである',done => {
          expect( first(response.body.body).actions instanceof Array ).equal(true);
          done();
        });

        it('actionsには_id,name,labelが含まれている', done => {
          const needle = ["_id", "name", "label"];
          const actions = first(response.body.body).actions;
          expect(
            chain(actions).first().pick(needle).keys().value().length === needle.length
          ).equal(true);
          done();
        });

      });
      describe('表示件数以上に登録されている場合',() => {
        let response;
        before(done => {
          const sendData = {dir_id : '', files: []};

          new Promise((resolve,reject) => {
            for(let i = 0 ; i < 31 ; i++){
              const files = Object.assign({}, requestPayload.files[0] );
              const _i = ("0" + i).slice(-2);
              files.name = `text${_i}.txt`;
              files.meta_infos = [{
                _id: meta_infos._id,
                value: `meta_value_${_i}`
              }];
              sendData.files.push( files );
            }
            request.post(base_url)
            .send(sendData)
            .end( ( err, res ) => {
              setTimeout(() => {
                resolve(res);
              }, 2000);
            });
          }).then(res => {
            done();
          });
        });

        describe('1ページ目を取得',() => {
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
          it('Arrayである',done => {
            expect( response.body.body instanceof Array ).equal(true);
            done();
          });
          it(`返却値のlengthは30である`,done =>{
            expect( response.body.body.length ).equal(30);
            done();
          });
        });
        describe('2ページ目を取得',() => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ page: 1 }) // 0始まりなので
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
          it('Arrayである',done => {
            expect( response.body.body instanceof Array ).equal(true);
            done();
          });
          it(`返却値のlengthは2である`,done =>{
            expect( response.body.body.length ).equal(2);
            done();
          });
        });
        describe('3ページ目を取得',() => {
          let response;
          before(done => {
            request.get(base_url)
            .query({ page: 2 }) // 0始まりなので
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
          it('Arrayである',done => {
            expect( response.body.body instanceof Array ).equal(true);
            done();
          });
          it(`返却値のlengthは0である`,done =>{
            expect( response.body.body.length ).equal(0);
            done();
          });
        });

        describe('並び替え',() => {
          let response;
          let display_items;
          before(done => {
            request.get("/api/v1/display_items")
            .end( ( err, res ) => {
              display_items = res.body.body;
              done();
            });
          });
          describe.skip('name',() => {
            describe('nameの降順',() => {
              let response;
              let file_names;
              before(done => {
                let display_item = display_items.filter(item => (item.name === "name"));
                request.get(base_url)
                .query({ sort: display_item[0]._id , order:'desc' })
                .end( ( err, res ) => {
                  response = res;
                  file_names = res.body.body.map(file => file.name);
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
              it('ファイルが名前の降順で取得できている',done =>{
                expect(response.body.body[0].name ).equal('text30.txt');
                expect(response.body.body[1].name ).equal('text29.txt');
                expect(response.body.body[2].name ).equal('text28.txt');
                expect(response.body.body[3].name ).equal('text27.txt');
                expect(response.body.body[4].name ).equal('text26.txt');
                expect(response.body.body[5].name ).equal('text25.txt');
                expect(response.body.body[6].name ).equal('text24.txt');
                expect(response.body.body[7].name ).equal('text23.txt');
                expect(response.body.body[8].name ).equal('text22.txt');
                expect(response.body.body[9].name ).equal('text21.txt');
                expect(response.body.body[10].name).equal('text20.txt');
                expect(response.body.body[11].name).equal('text19.txt');
                expect(response.body.body[12].name).equal('text18.txt');
                expect(response.body.body[13].name).equal('text17.txt');
                expect(response.body.body[14].name).equal('text16.txt');
                expect(response.body.body[15].name).equal('text15.txt');
                expect(response.body.body[16].name).equal('text14.txt');
                expect(response.body.body[17].name).equal('text13.txt');
                expect(response.body.body[18].name).equal('text12.txt');
                expect(response.body.body[19].name).equal('text11.txt');
                expect(response.body.body[20].name).equal('text10.txt');
                expect(response.body.body[21].name).equal('text09.txt');
                expect(response.body.body[22].name).equal('text08.txt');
                expect(response.body.body[23].name).equal('text07.txt');
                expect(response.body.body[24].name).equal('text06.txt');
                expect(response.body.body[25].name).equal('text05.txt');
                expect(response.body.body[26].name).equal('text04.txt');
                expect(response.body.body[27].name).equal('text03.txt');
                expect(response.body.body[28].name).equal('text02.txt');
                expect(response.body.body[29].name).equal('text01.txt' );
                done();
              });
            });

            describe('nameの昇順',() => {
              let response;
              let file_names;
              before(done => {
                let display_item = display_items.filter(item => (item.name === "name"));
                request.get(base_url)
                .query({ sort: display_item[0]._id , order:'asc' })
                .end( ( err, res ) => {
                  response = res;
                  file_names = res.body.body.map(file => file.name);
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
              it('ファイルが名前の降順で取得できている',done =>{
                expect( response.body.body[0].name  ).equal( 'text.txt'   );
                expect( response.body.body[1].name  ).equal( 'text00.txt' );
                expect( response.body.body[2].name  ).equal( 'text01.txt' );
                expect( response.body.body[3].name  ).equal( 'text02.txt' );
                expect( response.body.body[4].name  ).equal( 'text03.txt' );
                expect( response.body.body[5].name  ).equal( 'text04.txt' );
                expect( response.body.body[6].name  ).equal( 'text05.txt' );
                expect( response.body.body[7].name  ).equal( 'text06.txt' );
                expect( response.body.body[8].name  ).equal( 'text07.txt' );
                expect( response.body.body[9].name  ).equal( 'text08.txt' );
                expect( response.body.body[10].name ).equal( 'text09.txt' );
                expect( response.body.body[11].name ).equal( 'text10.txt' );
                expect( response.body.body[12].name ).equal( 'text11.txt' );
                expect( response.body.body[13].name ).equal( 'text12.txt' );
                expect( response.body.body[14].name ).equal( 'text13.txt' );
                expect( response.body.body[15].name ).equal( 'text14.txt' );
                expect( response.body.body[16].name ).equal( 'text15.txt' );
                expect( response.body.body[17].name ).equal( 'text16.txt' );
                expect( response.body.body[18].name ).equal( 'text17.txt' );
                expect( response.body.body[19].name ).equal( 'text18.txt' );
                expect( response.body.body[20].name ).equal( 'text19.txt' );
                expect( response.body.body[21].name ).equal( 'text20.txt' );
                expect( response.body.body[22].name ).equal( 'text21.txt' );
                expect( response.body.body[23].name ).equal( 'text22.txt' );
                expect( response.body.body[24].name ).equal( 'text23.txt' );
                expect( response.body.body[25].name ).equal( 'text24.txt' );
                expect( response.body.body[26].name ).equal( 'text25.txt' );
                expect( response.body.body[27].name ).equal( 'text26.txt' );
                expect( response.body.body[28].name ).equal( 'text27.txt' );
                expect( response.body.body[29].name ).equal( 'text28.txt' );
                done();
              });
            });
          });

          describe('更新日時',() => {
            describe('更新日時の降順',() => {
              it.skip('更新日時の降順のテスト', done => {done();});
            });
            describe('更新日時の昇順',() => {
              it.skip('更新日時の昇順のテスト', done => {done();});
            });
          });
          describe('メンバー',() => {
            describe('メンバーの降順',() => {
              it.skip('メンバーの降順のテスト', done => {done();});
            });
            describe('メンバーの昇順',() => {
              it.skip('メンバーの昇順のテスト', done => {done();});
            });
          });

          describe('メタ情報',() => {
            describe('メタ情報「表示ファイル名」の降順',() => {
              let response;
              let file_metainfo_values;
              before(done => {
                try{
                  new Promise((resolve, reject) => {
                    const display_item = find(display_items, {name: "receive_file_name"} );
                    resolve(display_item);
                  }).then(res => {
                    const display_item = res;

                    request.get(base_url)
                    .query({ sort: display_item.meta_info_id , order:'desc' })
                    .end( ( err, res ) => {
                      response = res;
                      file_metainfo_values = res.body.body.filter(file=> file.meta_infos.length > 0).map(file => file.meta_infos[0].value);
                      done();
                    });
                  });
                }catch(e){
                  console.log(e);
                  done();
                }
              });
              it('http(200)が返却される', done => {
                expect(response.status).equal(200);
                done();
              });
              it('statusはtrue',done => {
                expect(response.body.status.success).equal(true);
                done();
              });
              it("メタ情報の降順である",done => {
                expect(file_metainfo_values[0]).equal( 'meta_value_30' );
                expect(file_metainfo_values[1]).equal( 'meta_value_29' );
                expect(file_metainfo_values[2]).equal( 'meta_value_28' );
                expect(file_metainfo_values[3]).equal( 'meta_value_27' );
                expect(file_metainfo_values[4]).equal( 'meta_value_26' );
                expect(file_metainfo_values[5]).equal( 'meta_value_25' );
                expect(file_metainfo_values[6]).equal( 'meta_value_24' );
                expect(file_metainfo_values[7]).equal( 'meta_value_23' );
                expect(file_metainfo_values[8]).equal( 'meta_value_22' );
                expect(file_metainfo_values[9]).equal( 'meta_value_21' );
                expect(file_metainfo_values[10]).equal( 'meta_value_20' );
                expect(file_metainfo_values[11]).equal( 'meta_value_19' );
                expect(file_metainfo_values[12]).equal( 'meta_value_18' );
                expect(file_metainfo_values[13]).equal( 'meta_value_17' );
                expect(file_metainfo_values[14]).equal( 'meta_value_16' );
                expect(file_metainfo_values[15]).equal( 'meta_value_15' );
                expect(file_metainfo_values[16]).equal( 'meta_value_14' );
                expect(file_metainfo_values[17]).equal( 'meta_value_13' );
                expect(file_metainfo_values[18]).equal( 'meta_value_12' );
                expect(file_metainfo_values[19]).equal( 'meta_value_11' );
                expect(file_metainfo_values[20]).equal( 'meta_value_10' );
                expect(file_metainfo_values[21]).equal( 'meta_value_09' );
                expect(file_metainfo_values[22]).equal( 'meta_value_08' );
                expect(file_metainfo_values[23]).equal( 'meta_value_07' );
                expect(file_metainfo_values[24]).equal( 'meta_value_06' );
                expect(file_metainfo_values[25]).equal( 'meta_value_05' );
                expect(file_metainfo_values[26]).equal( 'meta_value_04' );
                expect(file_metainfo_values[27]).equal( 'meta_value_03' );
                expect(file_metainfo_values[28]).equal( 'meta_value_02' );
                expect(file_metainfo_values[29]).equal( 'meta_value_01' );
                done();
              });
            });
            describe('メタ情報「表示ファイル名」の昇順',() => {
              let response;
              let file_metainfo_values;
              before(done => {

                new Promise((resolve, reject) => {
                  const display_item = find(display_items, {name: "receive_file_name"} );
                  resolve(display_item);
                }).then(res => {
                  const display_item = res;

                  request.get(base_url)
                  .query({ sort: display_item.meta_info_id , order:'asc' })
                  .end( ( err, res ) => {
                    response = res;
                    file_metainfo_values = res.body.body.filter(file=> file.meta_infos.length > 0).map(file => file.meta_infos[0].value);
                    done();
                  });

                });

              });
              it('http(200)が返却される', done => {
                expect(response.status).equal(200);
                done();
              });
              it('statusはtrue',done => {
                done();
              });
              it("メタ情報の昇順である",done => {
                expect(file_metainfo_values[0]).equal( 'meta_value_00' );
                expect(file_metainfo_values[1]).equal( 'meta_value_01' );
                expect(file_metainfo_values[2]).equal( 'meta_value_02' );
                expect(file_metainfo_values[3]).equal( 'meta_value_03' );
                expect(file_metainfo_values[4]).equal( 'meta_value_04' );
                expect(file_metainfo_values[5]).equal( 'meta_value_05' );
                expect(file_metainfo_values[6]).equal( 'meta_value_06' );
                expect(file_metainfo_values[7]).equal( 'meta_value_07' );
                expect(file_metainfo_values[8]).equal( 'meta_value_08' );
                expect(file_metainfo_values[9]).equal( 'meta_value_09' );
                expect(file_metainfo_values[10]).equal( 'meta_value_10' );
                expect(file_metainfo_values[11]).equal( 'meta_value_11' );
                expect(file_metainfo_values[12]).equal( 'meta_value_12' );
                expect(file_metainfo_values[13]).equal( 'meta_value_13' );
                expect(file_metainfo_values[14]).equal( 'meta_value_14' );
                expect(file_metainfo_values[15]).equal( 'meta_value_15' );
                expect(file_metainfo_values[16]).equal( 'meta_value_16' );
                expect(file_metainfo_values[17]).equal( 'meta_value_17' );
                expect(file_metainfo_values[18]).equal( 'meta_value_18' );
                expect(file_metainfo_values[19]).equal( 'meta_value_19' );
                expect(file_metainfo_values[20]).equal( 'meta_value_20' );
                expect(file_metainfo_values[21]).equal( 'meta_value_21' );
                expect(file_metainfo_values[22]).equal( 'meta_value_22' );
                expect(file_metainfo_values[23]).equal( 'meta_value_23' );
                expect(file_metainfo_values[24]).equal( 'meta_value_24' );
                expect(file_metainfo_values[25]).equal( 'meta_value_25' );
                expect(file_metainfo_values[26]).equal( 'meta_value_26' );
                expect(file_metainfo_values[27]).equal( 'meta_value_27' );
                expect(file_metainfo_values[28]).equal( 'meta_value_28' );
                expect(file_metainfo_values[29]).equal( 'meta_value_29' );
                done();
              });
            });
          });
        });

      });

      describe('dir_idを指定する',() => {

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
        it('Arrayである',done => {
          expect( response.body.body instanceof Array ).equal(true);
          done();
        });
      });

    });
  });

});