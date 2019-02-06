import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { first, has, chain, find, findIndex, indexOf, isMatch } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";
import moment from "moment";


mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/files";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;
var search_items;
var meta_infos;
var meta;
var meta_recieve_date = [];
var tags;
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

  describe(`post /search_detail`,() => {

    before(done => {
      const sendData = {dir_id : user.tenant.home_dir_id, files: []};
      const keyWords = [
        1, "日本語", "alpha", "@###", "alpha123", "[1]"
        , '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'
        , '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
        , '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
      ];

      new Promise((resolve,reject) => {
        // タグ一覧を取得
        request.get("/api/v1/tags").end((err,res)=>{
          tags = first(res.body.body);
          resolve(res);
        });

      }).then( res => {
        return new Promise((resolve, reject)=>{
          request.get('/api/v1/files/search_items').end((err,res) =>{
            search_items = res.body.body;
            resolve(res);
          });
        });

      }).then( res => {
        // メタ情報一覧を取得
        return new Promise((resolve, reject)=>{
          request.get('/api/v1/meta_infos').end((err,res) => {
            meta_infos = res.body.body;
            meta = {
              _id: find(res.body.body, {name:"display_file_name"})._id,
              value: "meta_value"
            };

            for(let i = 0 ; i < keyWords.length ; i++){
              const meta_date = moment().add(i,"days").format("YYYY-MM-DD h:mm:ss");
              meta_recieve_date.push({
                _id: find(res.body.body, {name:"receive_date_time"})._id,
                value: new Date(meta_date)
              });
            }
            resolve(res);
          });
        });
      }).then( res => {
        return new Promise((resolve, reject)=>{
          let _file = {};
          for(let i = 0 ; i < keyWords.length ; i++){
            const files = Object.assign({}, requestPayload.files[0] );
            files.name = `text_${keyWords[i]}.txt`;
            files.tags =[tags._id];
            files.meta_infos = [
              { _id: meta._id, value: `meta_value${keyWords[i]}` },
              meta_recieve_date[i]
            ];
            _file = [ ..._file, files ];
          }
          sendData["files"] = _file;
          request.post(base_url)
          .send(sendData)
          .end( ( err, res ) => {
            resolve(res);
          });
        });
      }).then( res => {
        done();
      });
    });


    describe('異常系',() => {

      describe('pageが不正',() => {
        const expected = {
          message: "ファイル一覧の取得に失敗しました",
          detail: "pageが数字ではないためファイル一覧の取得に失敗しました"
        };
        describe('pageが""', () => {
          let response;
          before(done => {
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: ""
            })
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
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: '\/:*?<>|'
            })
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
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: 'ichi'
            })
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
            request.get(`${base_url}`)
            .query({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              sort: ''
            })
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
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: 0,
              sort: '\/:*?<>|'
            })
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
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: 0,
              sort: 'ichi'
            })
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
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: 0,
              order: ''
            })
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
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: 0,
              order: '\/:*?<>|'
            })
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
            request.post(`${base_url}/search_detail`)
            .send({
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page: 0,
              order: 'koujun'
            })
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
      let target_tag;
      let role_user;
      let role_file;
      let file_id;
      before(done => {
        try {
          const sendQuery = {
            [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
            page:0,
            order: "asc"
          };

          const newTag = {
            tag:{
              label:"新規タグ",
              color:"#FEDCBA"
            }
          };
          let meta_info_id;
          new Promise((resolve,reject) => {
            request.post("/api/v1/tags")
            .send(newTag)
            .end( ( err, res ) => {
              target_tag = res.body.body;
              resolve(res);
            });
          }).then(res=>{
            return new Promise((resolve,reject) => {
              meta_info_id = find(meta_infos, {name:"receive_company_name"})._id;
              resolve(res);
            });
          }).then(res=>{
            return new Promise((resolve,reject) => {
              const sendData = {dir_id : user.tenant.home_dir_id, files: []};
              const files = Object.assign({}, requestPayload.files[0] );
              files.name = `メタ表示名.txt`;
              files.meta_infos = [ {
                _id: meta_info_id,
                value: "受信会社名"
              } ];
              files.tags = [ target_tag._id ];
              sendData.files.push( files );
              request.post(base_url)
              .send(sendData)
              .end( ( err, res ) => {
                resolve(res);
              });
            });
          }).then(res=>{
            return new Promise((resolve, reject) =>{
              request.get(`${base_url}/search`)
              .query({q:"メタ表示名"})
              .end((err,res) => {
                resolve(res);
              });
            });
          }).then(res=>{
            file_id = (find(res.body.body, { name: 'メタ表示名.txt'}))._id;
          }).then(res=>{
            return new Promise((resolve, reject) =>{
              request.get("/api/v1/users")
              .end((err,res) => {
                role_user = ( find(res.body.body, { name: "hanako" }) );
                resolve(res);
              });
            });
          }).then(res=>{
            return new Promise((resolve, reject) =>{
              request.get("/api/v1/role_files")
              .end((err,res) => {
                role_file = (find(res.body.body, { name: "フルコントロール" }));
                resolve(res);
              });
            });
          }).then(res=>{
            return new Promise((resolve,reject) => {
              const url = `${base_url}/${file_id}/authorities`;
              request.post(url)
              .send(
                { user: role_user, role: role_file }
              )
              .end((err, res) => {
                resolve(res);
              });
            });
          }).then(res=>{
            return new Promise((resolve, reject) => {
              request.patch(`${base_url}/${file_id}/toggle_star`)
              .end((err,res) => {
                resolve(res);
              });
            });

          }).then(res=>{
            done();
          });

        } catch (error) {
          console.log(error);
          done();
        }

      });

      describe('検索',() => {

        describe('検索条件: text',() => {
          let response;
          before(done => {
            try {
              const sendQuery = {
                [find(search_items, {name:'name'} )._id]:"text",
                // [meta._id]: meta.value,
                // sort: find(search_items, {name:'name'} )._id,
                page:0,
                order: "asc"
              };

              request.post(`${base_url}/search_detail`)
              .send(sendQuery)
              .end( ( err, res ) => {
                if(err) throw err;
                response = res;
                done();
              });
            } catch (error) {
              console.error(error);
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

          it('Arrayである',done => {
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

          it('dir_routeが含まれる', done => {
            expect( chain(response.body.body).first().has('dir_route').value() ).equal(true);
            done();
          });

          it('dir_routeはstringである',done => {
            expect( typeof first(response.body.body).dir_route ).equal('string');
            done();
          });

        });

        describe.skip('検索条件 更新日時(より大きい): 前日',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'modified_greater'} )._id]: moment().add('days', -1).format("YYYY-MM-DD HH:mm:ss"),
              page:0,
              order: "asc"
            };
            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは30である',done => {
            expect( response.body.body.length ).equal(30);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

        });

        describe.skip('検索条件 更新日時(より大きい): 今',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'modified_greater'} )._id]: moment().format("YYYY-MM-DD HH:mm:ss"),
              page:0,
              order: "asc"
            };
            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは0である',done => {
            expect( response.body.body.length ).equal(0);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

        });

        describe.skip('検索条件 更新日時(より小さい): 前日',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'modified_less'} )._id]: moment().add('days', -1).format("YYYY-MM-DD HH:mm:ss"),
              page:0,
              order: "asc"
            };
            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは0である',done => {
            expect( response.body.body.length ).equal(0);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe.skip('検索条件 更新日時(より小さい): 今',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'modified_less'} )._id]: moment().format("YYYY-MM-DD HH:mm:ss"),
              page:0,
              order: "asc"
            };
            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは30である',done => {
            expect( response.body.body.length ).equal(30);
            done();
          });
        });

        describe('検索条件 受信企業名（メタ情報）: 受信会社名',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              page:0,
              order: "asc"
            };
            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは1である',done => {
            expect( response.body.body.length ).equal(1);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

          it('meta_infosが含まれる', done => {
            expect(has( first(response.body.body), 'meta_infos')).equal(true);
            done();
          });

          it('meta_infosに指定したメタ情報が含まれる', done => {
            expect(　findIndex( first(response.body.body).meta_infos ,{ label:"受信企業名",value:"受信会社名" })  >= 0).equal(true);
            done();
          });

        });

        describe('検索条件 ファイル名:日本語',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'name'} )._id]:"日本語",
              page:0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは1である',done => {
            expect( response.body.body.length ).equal(1);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

          it('nameに「日本語」が含まれる',done =>{
            expect( response.body.body[0].name.match(/日本語/) !== null).equal(true);
            done();
          });

        });

        describe('検索条件(複合) ファイル名:メタ表示名 ,受信企業名（メタ情報）: 受信会社名',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              [find(search_items, {name:'name'} )._id]:"メタ表示名",
              page:0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは1である',done => {
            expect( response.body.body.length ).equal(1);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

          it('nameに「メタ表示名」が含まれる',done =>{
            expect( response.body.body[0].name.match(/メタ表示名/) !== null).equal(true);
            done();
          });

          it('meta_infosが含まれる', done => {
            expect(has( first(response.body.body), 'meta_infos')).equal(true);
            done();
          });

          it('meta_infosに指定したメタ情報が含まれる', done => {
            expect(　findIndex( first(response.body.body).meta_infos ,{ label:"受信企業名",value:"受信会社名" })  >= 0).equal(true);
            done();
          });
        });

        describe('検索条件が正規表現: text[1-3]',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'name'} )._id]:"text[1-3]",
              page:0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは0である',done => {
            expect( response.body.body.length ).equal(0);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe('タグで検索: 新規タグ',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'tag'} )._id]: target_tag._id,
              page: 0,
              order: "asc"
            };
            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは1である',done => {
            expect( response.body.body.length ).equal(1);
            done();
          });

          it('tagsが含まれる', done => {
            expect(has( first(response.body.body), 'tags')).equal(true);
            done();
          });

          it('tagsに指定したメタ情報が含まれる', done => {
            expect(　findIndex( first(response.body.body).tags , target_tag)  >= 0).equal(true);
            done();
          });

          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });

        });

        describe('メンバーで検索',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'authorities'} )._id]: role_user._id.toString(),
              page:0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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
          it('返却値のlengthは3である',done => {
            expect( response.body.body.length ).equal(3);
            done();
          });
          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

        describe('お気に入りで検索: true',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'favorite'} )._id]: true,
              page:0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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
          it('返却値のlengthは1である',done => {
            expect( response.body.body.length ).equal(1);
            done();
          });
          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
          it('is_starはtrueである',done => {
            expect( first(response.body.body).is_star ).equal(true);
            done();
          });

        });

        describe('お気に入りで検索: false',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'favorite'} )._id]: false,
              page:0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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
          it('返却値のlengthは30である',done => {
            expect( response.body.body.length ).equal(30);
            done();
          });
          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
          it('is_starはtrueである',done => {
            expect( first(response.body.body).is_star ).equal(false);
            done();
          });
        });

        describe('検索条件(複合) ファイル名:メタ表示名 ,受信企業名（メタ情報）: 受信会社名, メンバー:hanako',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(meta_infos, {name:'receive_company_name'} )._id]:"受信会社名",
              [find(search_items, {name:'name'} )._id]:"メタ表示名",
              [find(search_items, {name:'authorities'} )._id]: role_user._id.toString(),
              page:0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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
          it('返却値のlengthは1である',done => {
            expect( response.body.body.length ).equal(1);
            done();
          });
          it('totalが30以下の場合,lengthと一致する',done => {
            if(response.body.status.total <= 30 ) {
              expect(response.body.body.length).equal(response.body.status.total);
            }
            done();
          });
        });

      });
      describe('ページャー',() =>{

        describe('検索条件: なし, page:0 ,order: asc',() => {
          let response;
          before(done => {
            const sendQuery = {
              page: 0,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは30である',done => {
            expect( response.body.body.length ).equal(30);
            done();
          });

        });

        describe('検索条件: なし, page:1 ,order: asc',() => {
          let response;
          before(done => {
            const sendQuery = {
              page: 1,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは9である',done => {
            expect( response.body.body.length ).equal(9);
            done();
          });

        });

        describe('検索条件: ファイル名:text, page:1 ,sort: name ,order: asc',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'name'} )._id]:"text",
              page: 0,
              sort: find(search_items, {name:'name'} )._id,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it("ファイル名の昇順である",done => {
            expect( response.body.body[0].name ).equal("text_01.txt");
            expect( response.body.body[1].name ).equal("text_02.txt");
            expect( response.body.body[2].name ).equal("text_03.txt");
            expect( response.body.body[3].name ).equal("text_04.txt");
            expect( response.body.body[4].name ).equal("text_05.txt");
            expect( response.body.body[5].name ).equal("text_06.txt");
            expect( response.body.body[6].name ).equal("text_07.txt");
            expect( response.body.body[7].name ).equal("text_08.txt");
            expect( response.body.body[8].name ).equal("text_09.txt");
            expect( response.body.body[9].name ).equal("text_1.txt");
            expect( response.body.body[10].name ).equal("text_10.txt");
            expect( response.body.body[11].name ).equal("text_11.txt");
            expect( response.body.body[12].name ).equal("text_12.txt");
            expect( response.body.body[13].name ).equal("text_13.txt");
            expect( response.body.body[14].name ).equal("text_14.txt");
            expect( response.body.body[15].name ).equal("text_15.txt");
            expect( response.body.body[16].name ).equal("text_16.txt");
            expect( response.body.body[17].name ).equal("text_17.txt");
            expect( response.body.body[18].name ).equal("text_18.txt");
            expect( response.body.body[19].name ).equal("text_19.txt");
            expect( response.body.body[20].name ).equal("text_20.txt");
            expect( response.body.body[21].name ).equal("text_21.txt");
            expect( response.body.body[22].name ).equal("text_22.txt");
            expect( response.body.body[23].name ).equal("text_23.txt");
            expect( response.body.body[24].name ).equal("text_24.txt");
            expect( response.body.body[25].name ).equal("text_25.txt");
            expect( response.body.body[26].name ).equal("text_26.txt");
            expect( response.body.body[27].name ).equal("text_27.txt");
            expect( response.body.body[28].name ).equal("text_28.txt");
            expect( response.body.body[29].name ).equal("text_29.txt");
            done();
          });


          it('返却値のlengthは30である',done => {
            const files = response.body.body.map(file => file.name);
            expect( response.body.body.length ).equal(30);
            done();
          });

        });

        describe('検索条件: ファイル名:text, page:1 ,sort: name ,order: desc',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'name'} )._id]:"text",
              page: 0,
              sort: find(search_items, {name:'name'} )._id,
              order: "desc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it("ファイル名の降順である",done => {
            expect( response.body.body[0].name ).equal("text_日本語.txt");
            expect( response.body.body[1].name ).equal("text_alpha123.txt");
            expect( response.body.body[2].name ).equal("text_alpha.txt");
            expect( response.body.body[3].name ).equal("text_[1].txt");
            expect( response.body.body[4].name ).equal("text_@###.txt");
            expect( response.body.body[5].name ).equal("text_30.txt");
            expect( response.body.body[6].name ).equal("text_29.txt");
            expect( response.body.body[7].name ).equal("text_28.txt");
            expect( response.body.body[8].name ).equal("text_27.txt");
            expect( response.body.body[9].name ).equal("text_26.txt");
            expect( response.body.body[10].name ).equal("text_25.txt");
            expect( response.body.body[11].name ).equal("text_24.txt");
            expect( response.body.body[12].name ).equal("text_23.txt");
            expect( response.body.body[13].name ).equal("text_22.txt");
            expect( response.body.body[14].name ).equal("text_21.txt");
            expect( response.body.body[15].name ).equal("text_20.txt");
            expect( response.body.body[16].name ).equal("text_19.txt");
            expect( response.body.body[17].name ).equal("text_18.txt");
            expect( response.body.body[18].name ).equal("text_17.txt");
            expect( response.body.body[19].name ).equal("text_16.txt");
            expect( response.body.body[20].name ).equal("text_15.txt");
            expect( response.body.body[21].name ).equal("text_14.txt");
            expect( response.body.body[22].name ).equal("text_13.txt");
            expect( response.body.body[23].name ).equal("text_12.txt");
            expect( response.body.body[24].name ).equal("text_11.txt");
            expect( response.body.body[25].name ).equal("text_10.txt");
            expect( response.body.body[26].name ).equal("text_1.txt");
            expect( response.body.body[27].name ).equal("text_09.txt");
            expect( response.body.body[28].name ).equal("text_08.txt");
            expect( response.body.body[29].name ).equal("text_07.txt");
            done();
          });

          it('返却値のlengthは30である',done => {
            const files = response.body.body.map(file => file.name);
            expect( response.body.body.length ).equal(30);
            done();
          });

        });

        describe('検索条件: ファイル名:text, page:1 ,sort: display_file_name ,order: asc',() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'name'} )._id]:"txt",
              page: 1,
              sort: find(search_items, {name:'display_file_name'} )._id,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it("メタ情報「表示ファイル名」の昇順である",done => {
            expect( find(response.body.body[0].meta_infos , {label:'表示ファイル名'} ).value  ).equal("meta_value29");
            expect( find(response.body.body[1].meta_infos , {label:'表示ファイル名'} ).value  ).equal("meta_value30");
            expect( find(response.body.body[2].meta_infos , {label:'表示ファイル名'} ).value  ).equal("meta_value@###");
            expect( find(response.body.body[3].meta_infos , {label:'表示ファイル名'} ).value  ).equal("meta_value[1]");
            expect( find(response.body.body[4].meta_infos , {label:'表示ファイル名'} ).value  ).equal("meta_valuealpha");
            expect( find(response.body.body[5].meta_infos , {label:'表示ファイル名'} ).value  ).equal("meta_valuealpha123");
            expect( find(response.body.body[6].meta_infos , {label:'表示ファイル名'} ).value  ).equal("meta_value日本語");
            done();
          });

          it('返却値のlengthは30である',done => {
            const files = response.body.body.map(file => file.name);
            expect( response.body.body.length ).equal(7);
            done();
          });

        });

        describe(`メタ情報「受信日時」検索:${moment().add(1, "days").format("YYYY-MM-DD")} ~ ${moment().add(3,"days").format("YYYY-MM-DD")}`,() => {
          let response;
          before(done => {
            const sendQuery = {
              [find(search_items, {name:'receive_date_time'} )._id]:{
                "gt": moment().add(1, "days").format("YYYY-MM-DD") ,
                "lt": moment().add(3 ,"days").format("YYYY-MM-DD")
              },
              page: 0,
              sort: find(search_items, {name:'receive_date_time'} )._id,
              order: "asc"
            };

            request.post(`${base_url}/search_detail`)
            .send(sendQuery)
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

          it('返却値のlengthは3である',done => {
            expect( response.body.body.length ).equal(3);
            done();
          });

          it('受信日時は明日から3日後までである',done => {
            expect( moment(find( response.body.body[0].meta_infos,{label: '受信日時'} ).value).format("YYYY-MM-DD") ).equal( moment().add(1, "days").format("YYYY-MM-DD") );
            expect( moment(find( response.body.body[1].meta_infos,{label: '受信日時'} ).value).format("YYYY-MM-DD") ).equal( moment().add(2,"days").format("YYYY-MM-DD") );
            expect( moment(find( response.body.body[2].meta_infos,{label: '受信日時'} ).value).format("YYYY-MM-DD") ).equal( moment().add(3,"days").format("YYYY-MM-DD") );
            done();
          });

        });

      });
    });
  });

});
