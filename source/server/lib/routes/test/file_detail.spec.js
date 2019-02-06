import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { first, has, chain, findIndex, indexOf, isMatch } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

// model
import User from "../../models/User";
import { resolve } from "url";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/files";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;

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
    initdbPromise.then( () => {
      request.post(login_url)
        .send(authData)
        .end( (err, res) => {
          user = res.body.body.user;
          request.set('x-auth-cloud-storage', res.body.body.token);
          done();
        });
    });
  });

  describe('get /:file_id',() => {
    let file_id;
    before( done => {
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

    describe('異常系',() => {
      describe('存在しないfile_idを指定',() => {
        const expected = {
          message: "ファイルの取得に失敗しました",
          detail: "指定されたファイルが見つかりません"
        };
        let response;
        before(done => {
          const id = new mongoose.Types.ObjectId();
          const url = `${base_url}/${id}`;
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
          expect(response.body.status.errors.message).equal(expected.detail);
          done();
        });

      });

      describe('file_idにでたらめな文字列を指定',() => {
        const expected = {
          message: "ファイルの取得に失敗しました",
          detail: "ファイルIDが不正なためファイルの取得に失敗しました"
        };
        let response;
        before(done => {
          const id = "jofoaefiawofjeowfjeijfeofijejifoaw";
          const url = `${base_url}/${id}`;
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
          expect(response.body.status.errors.message).equal(expected.detail);
          done();
        });
      });

      describe('指定しているfile_idがフォルダ',() => {
        const expected = {
          message: "ファイルの取得に失敗しました",
          detail: "フォルダを指定しているためファイルの取得に失敗しました"
        };
        let response;
        before(done => {
          const create_dir_body = { dir_name:"ディレクトリ" };
          // フォルダを作成
          new Promise((resolve, reject) => {
            request.post('/api/v1/dirs')
            .send(create_dir_body).
            end((err,res) => {
              resolve(res);
            });
          }).then(res => {
            // 作成したフォルダのIDを取得
            return new Promise((resolve,reject)=>{
              request.get(`/api/v1/files`).end((err,res) => {
                const create_dir = res.body.body.filter(file => (file.name === create_dir_body.dir_name) );
                resolve(create_dir);
              });
            });
          }).then(res => {
            request.get(`${base_url}/${res[0]._id}`)
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
          expect(response.body.status.errors.message).equal(expected.detail);
          done();
        });
      });

      describe('削除済みのfile_idを指定',() => {
        const expected = {
          message: "ファイルの取得に失敗しました",
          detail: "ファイルは既に削除されているためファイルの取得に失敗しました"
        };
        let delete_file;
        let response;
        before(done => {
          new Promise((resolve,reject)=>{
            request.post('/api/v1/files')
            .send(requestPayload).
            end((err,res) => {
              resolve(res);
            });

          }).then(res => {
            // ファイルをゴミ箱に移動
            return new Promise( (resolve, reject) => {
              request.delete(`/api/v1/files/${res.body.body[0]._id}`).end((err, res) => {
                resolve(res);
              });
            });
          }).then(res => {
            delete_file = res.body.body;
            // ファイルをゴミ箱から削除
            return new Promise((resolve,reject)=>{
              request.delete(`${base_url}/${delete_file._id}/delete`).end((err,res) => {
                resolve(res);
              });
            });

          }).then(res => {
            // ゴミ箱から削除したファイルの詳細を取得
            return new Promise(( resolve,reject ) => {
              request.get(`${base_url}/${delete_file._id}`)
              .end( ( err, res ) => {
                response = res;
                resolve(res);
              });
            });
          }).then(res =>{
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
          expect(response.body.status.errors.message).equal(expected.detail);
          done();
        });
      });

      describe('閲覧権限がないfile_id',() => {
        const expected = {
          message: "ファイルの取得に失敗しました",
          detail: "指定されたファイルが見つかりません"
        };
        let response;
        before(done => {
          const url = `${base_url}/${file_id}`;

          const new_auth_data = {
            account_name: "hanako",
            name: "hanako",
            email: "hanako",
            password: "test"
          };

          new Promise((resolve,reject)=>{
            request.post(login_url).send(new_auth_data).end( (err, res) => {
              request.set('x-auth-cloud-storage', res.body.body.token);
              resolve(res);
            });
          }).then(res => {
            return new Promise((resolve,reject) => {
              request.get(url)
              .end( ( err, res ) => {
                response = res;
                resolve(res);
              });
            });
          }).then(res =>{
            done();
          });;
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
          expect(response.body.status.errors.message).equal(expected.detail);
          done();
        });

        after(done => {
          request.post(login_url).send(authData).end( (err, res) => {
            request.set('x-auth-cloud-storage', res.body.body.token);
            done();
          });
        });

      });

    });
    describe('正常系',() => {

      let response;
      before(done => {
        const url = `${base_url}/${file_id}`;
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

      it('mime_typeが含まれる', done => {
        expect(has(response.body.body, 'mime_type')).equal(true);
        done();
      });

      it('mime_typeはstringである',done => {
        expect( typeof response.body.body.mime_type ).equal('string');
        done();
      });

      it('sizeが含まれる', done => {
        expect(has(response.body.body, 'size')).equal(true);
        done();
      });

      it('sizeはnumberである',done => {
        expect( typeof response.body.body.size ).equal('number');
        done();
      });

      it('is_dirが含まれる', done => {
        expect(has(response.body.body, 'is_dir')).equal(true);
        done();
      });

      it('is_dirはbooleanである',done => {
        expect( typeof response.body.body.is_dir ).equal('boolean');
        done();
      });

      it('dir_idが含まれる', done => {
        expect(has(response.body.body, 'dir_id')).equal(true);
        done();
      });

      it('dir_idはObjectIdである',done => {
        expect(mongoose.Types.ObjectId.isValid(response.body.body.dir_id)).equal(true);
        done();
      });

      it('is_displayが含まれる', done => {
        expect(has(response.body.body, 'is_display')).equal(true);
        done();
      });

      it('is_displayはbooleanである',done => {
        expect( typeof response.body.body.is_display ).equal('boolean');
        done();
      });

      it('is_starが含まれる', done => {
        expect(has(response.body.body, 'is_star')).equal(true);
        done();
      });

      it('is_starはbooleanである',done => {
        expect( typeof response.body.body.is_star ).equal('boolean');
        done();
      });

      it('is_cryptedが含まれる', done => {
        expect(has(response.body.body, 'is_crypted')).equal(true);
        done();
      });

      it('is_cryptedはbooleanである',done => {
        expect( typeof response.body.body.is_crypted ).equal('boolean');
        done();
      });

      it('historiesが含まれる', done => {
        expect(has(response.body.body, 'histories')).equal(true);
        done();
      });

      it('historiesはArrayである',done => {
        expect( response.body.body.histories instanceof Array ).equal(true);
        done();
      });

      it('historiesはbodyを持つ', done => {
        expect(has( first(response.body.body.histories), 'body')).equal(true);
        done();
      });
      it('historiesはactionを持つ', done => {
        expect(has( first(response.body.body.histories), 'action')).equal(true);
        done();
      });
      it('histories.actionはstringである',done => {
        expect( typeof first(response.body.body.histories).action ).equal('string');
        done();
      });
      it('historiesはuserを持つ', done => {
        expect(has( first(response.body.body.histories), 'user')).equal(true);
        done();
      });
      it('historiesのuserはobjectである',done => {
        expect( typeof first(response.body.body.histories).user ).equal('object');
        done();
      });

      it("historiesのuserには_id,account_name,name,email,password,enabled,tenant_id,groups,typeが含まれている", done => {
        const needle = ["_id", "account_name", "name", "email", "password", "enabled", "tenant_id", "groups", "type"];
        expect(
          chain( first(response.body.body.histories).user ).pick(needle).keys().value().length === needle.length
        ).equal(true);

        done();
      });

      it('historiesはmodifiedを持つ', done => {
        expect(has( first(response.body.body.histories), 'modified')).equal(true);
        done();
      });
      it('histories.modifiedはstringである',done => {
        expect( typeof first(response.body.body.histories).modified ).equal('string');
        done();
      });

      it('tagsが含まれる', done => {
        expect(has(response.body.body, 'tags')).equal(true);
        done();
      });

      it('tagsはArrayである',done => {
        expect( response.body.body.tags instanceof Array ).equal(true);
        done();
      });

      it('tagsには_id,color,label,tenant_idが含まれている', done => {
        const needle = [ "_id", "color", "label", "tenant_id"];
        expect(
          chain( response.body.body.tags ).first().pick(needle).keys().value().length === needle.length
        ).equal(true);
        done();
      });

      it('is_deletedが含まれる', done => {
        expect(has(response.body.body, 'is_deleted')).equal(true);
        done();
      });

      it('is_deletedはbooleanである',done => {
        expect( typeof response.body.body.is_deleted ).equal('boolean');
        done();
      });

      it('modifiedが含まれる', done => {
        expect(has(response.body.body, 'modified')).equal(true);
        done();
      });

      it('modifiedはstringである',done => {
        expect( typeof response.body.body.modified ).equal('string');
        done();
      });

      it('preview_idが含まれる', done => {
        expect(has(response.body.body, 'preview_id')).equal(true);
        done();
      });

      it('preview_idはnullまたはObjectIdである',done => {
        if(response.body.body.preview_id === null){
          expect(response.body.body.preview_id).equal(null);
        }else{
          expect(mongoose.Types.ObjectId.isValid(response.body.body.preview_id)).equal(true);
        }
        done();
      });

      it('authoritiesが含まれる', done => {
        expect(has(response.body.body, 'authorities')).equal(true);
        done();
      });

      it('authoritiesはArrayである',done => {
        expect( response.body.body.authorities instanceof Array ).equal(true);
        done();
      });

      it('authorities[0]にはrole_files, users, actionsが含まれている', done => {
        const needle = ["role_files", "users", "actions"];
        expect(
          chain( response.body.body.authorities ).first().pick(needle).keys().value().length === needle.length
        ).equal(true);
        done();
      });

      it('authorities[0].actionsには_id,name,labelが含まれている', done => {
        const needle = ["_id", "name", "label"];
        expect(
          chain( first(response.body.body.authorities).actions ).first().pick(needle).keys().value().length === needle.length
        ).equal(true);
        done();
      });

      it('dirsが含まれる', done => {
        expect(has(response.body.body, 'dirs')).equal(true);
        done();
      });

      it('dirsはArrayである',done => {
        expect( response.body.body.dirs instanceof Array ).equal(true);
        done();
      });

      it('dirsには_id,ancestor,descendant,depthが含まれている', done => {
        const needle = ["_id", "ancestor", "descendant", "depth"];
        expect(
          chain( response.body.body.dirs ).first().pick(needle).keys().value().length === needle.length
        ).equal(true);
        done();
      });

      it('meta_infosが含まれる', done => {
        expect(has(response.body.body, 'meta_infos')).equal(true);
        done();
      });

      it('meta_infosはArrayである',done => {
        expect( response.body.body.meta_infos instanceof Array ).equal(true);
        done();
      });

      it('meta_infosには_id,label,value_type,valueが含まれている', done => {
        const needle = ["_id", "label", "value_type", "value"];
        expect(
          chain( response.body.body.meta_infos ).first().pick(needle).keys().value().length === needle.length
        ).equal(true);
        done();
      });

    });

  });

});
