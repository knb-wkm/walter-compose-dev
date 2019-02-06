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

const { ObjectId } = mongoose.Types;

const groups_url = "/api/v1/groups";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;

describe(groups_url + "/:group_id", () => {

  before( done => {
    initdbPromise.then( () => {
      new Promise( (resolve, reject) => {
        request.post(login_url)
          .send(authData)
          .end( (err, res) => {
            request.set("x-auth-cloud-storage", res.body.body.token);
            resolve(res);
          });
      }).then( res => {
        const user_id = res.body.body._id;

        return new Promise( (resolve, reject) => {
          request
            .get(`/api/v1/users/${user_id}`)
            .end( (err, res) => resolve(res));
        });
      }).then( res => {
        user = res.body.body;
        done();
      });
    });
  });

  // グループ一覧
  describe("get /", () => {
    let payload;

    before( done => {
      request
        .get(groups_url)
        .end( (err, res) => {
          payload = res;
          done();
        });
    });

    it("http(200)が返却される", done => {
      expect(payload.status).equal(200);
      done();
    });

    describe("返却されるオブジェクトは", () => {
      it("_idカラムが存在しoid型", done => {
        const ids = payload.body.body.map( obj => ObjectId.isValid(obj._id) );
        expect(ids.every( id => id === true)).equal(true);
        done();
      });

      it("nameカラムが存在し0文字以上", done => {
        const names = payload.body.body.map( obj => obj.name.length > 0 );
        expect(names.every( name => name === true)).equal(true);
        done();
      });

      it("descriptionカラムが存在し0文字以上", done => {
        const descriptions = payload.body.body.map( obj => obj.description.length > 0 );
        expect(descriptions.every( desc => desc === true )).equal(true);
        done();
      });

      it("role_filesカラムが存在し配列型", done => {
        const role_files = payload.body.body.map( obj => Array.isArray(obj.role_files) );
        expect(role_files.every( rf => rf === true )).equal(true);
        done();
      });

      it("tenant_idカラムが存在しoid型", done => {
        const tenant_ids = payload.body.body.map( obj => ObjectId.isValid(obj.tenant_id) );
        expect(tenant_ids.every( id => id === true )).equal(true);
        done();
      });

      it("rolesカラムが存在し配列型", done => {
        const roles = payload.body.body.map( obj => Array.isArray(obj.roles) );
        expect(roles.every( role => role === true )).equal(true);
        done();
      });

      it("belongs_toカラムが存在し配列型", done => {
        const belongs_tos = payload.body.body.map( obj => Array.isArray(obj.belongs_to) );
        expect(belongs_tos.every( belong => belong === true )).equal(true);
        done();
      });
    });
  });

  describe("post /", () => {
    describe("name, descriptionを指定し正しく作成した場合", () => {
      let payload;
      let body = {
        group: {
          name: "newGroup",
          description: "newGroup description"
        }
      };

      before( done => {
        request
          .post(groups_url)
          .send(body)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("作成したグループを取得した場合", () => {
        let nextPayload;

        before( done => {
          const group_id = payload.body.body._id;

          request
            .get(groups_url + `/${group_id}`)
            .end( (err, res) => {
              nextPayload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(nextPayload.status).equal(200);
          done();
        });

        it("_idカラムが存在しoid型", done => {
          expect(ObjectId.isValid(payload.body.body._id)).equal(true);
          done();
        });

        it("nameカラムが存在し0文字以上", done => {
          expect(payload.body.body.name.length > 0).equal(true);
          done();
        });

        it("descriptionカラムが存在し0文字以上", done => {
          expect(payload.body.body.description.length > 0).equal(true);
          done();
        });

        it.skip("role_filesカラムが存在し配列型", done => {
          expect(Array.isArray(payload.body.body.role_files)).equal(true);
          done();
        });

        it("tenant_idカラムが存在しoid型", done => {
          expect(ObjectId.isValid(payload.body.body.tenant_id))
            .equal(true);
          done();
        });

        it("rolesカラムが存在し配列型", done => {
          expect(Array.isArray(payload.body.body.roles)).equal(true);
          done();
        });

        it.skip("belongs_toカラムが存在し配列", done => {
          expect(Array.isArray(payload.body.body.belongs_to)).equal(true);
          done();
        });
      });
    });
  });

  describe("get /:group_id", () => {
    let payload;
    let group;

    before( done => {
      new Promise( (resolve, reject) => {

        request
          .get(groups_url)
          .end( (err, res) => resolve(res) );

      }).then( res => {
        group = _.head(res.body.body);

        return new Promise( (resolve, reject) => {
          request
            .get(groups_url + `/${group._id}`)
            .end( (err, res) => resolve(res) );
        });

      }).then( res => {
        payload = res;
        done();
      });
    });

    it("http(200)が返却される", done => {
      expect(payload.status).equal(200);
      done();
    });

    describe("返却されるオブジェクトは", () => {
      it("_idカラムが存在しoid型", done => {
        expect(ObjectId.isValid(payload.body.body._id)).equal(true);
        done();
      });

      it("nameカラムが存在し0文字以上", done => {
        expect(payload.body.body.name.length > 0).equal(true);
        done();
      });

      it("descriptionカラムが存在し0文字以上", done => {
        expect(payload.body.body.description.length > 0).equal(true);
        done();
      });

      it("role_filesカラムが存在し配列型", done => {
        expect(Array.isArray(payload.body.body.role_files)).equal(true);
        done();
      });

      it("tenant_idカラムが存在しoid型", done => {
        expect(ObjectId.isValid(payload.body.body.tenant_id))
          .equal(true);
        done();
      });

      it("rolesカラムが存在し配列型", done => {
        expect(Array.isArray(payload.body.body.roles)).equal(true);
        done();
      });

      it("belongs_toカラムが存在し配列", done => {
        expect(Array.isArray(payload.body.body.belongs_to)).equal(true);
        done();
      });
    });
  });

  describe("delete /:group_id", () => {
    let group;

    before( done => {
      request
        .get(groups_url)
        .end( (err, res) => {
          group = _.head(res.body.body);
          done();
        });
    });

    // 色々削除するので初期化する
    after( done => {
      initdbPromise.then( () => done() );
    });

    describe("存在するgroup_idを指定した場合", () => {
      let payload;

      before( done => {
        request
          .delete(groups_url + `/${group._id}`)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("削除したグループを取得した場合", () => {
        let payload;

        before( done => {
          request
            .get(groups_url + `/${group._id}`)
            .end( (err, res) => {
              payload = res;
              done();
            });
        });

        it("http(400)が返却される", done => {
          expect(payload.status).equal(400);
          done();
        });
      });

      describe("ユーザ一覧を取得した場合", () => {
        let users;

        before( done => {
          request
            .get("/api/v1/users")
            .end( (err, res) => {
              users = res;
              done();
            });
        });

        it("削除したグループに所属するユーザは存在しない", done => {
          const belongs = _.flatten(users.body.body.map( user => user.groups ));
          expect(belongs.filter( id => group._id === id).length === 0).equal(true);
          done();
        });

      });
    });
  });

  describe("patch /:group_id/name", () => {
    let group;

    before( done => {
      request
        .get(groups_url)
        .end( (err, res) => {
          group = _.head(res.body.body);
          done();
        });
    });

    describe("正しいgroup_id, nameを指定した場合", () => {
      let payload;
      let body = {
        name: "changedGroupName"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/name`)
          .send(body)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("名前を変更したグループを取得した場合", () => {
        let payload;

        before( done => {
          request
            .get(groups_url + `/${group._id}`)
            .end( (err, res) => {
              payload = res;
              done();
            });
        });

        it("変更した値が反映されている", done => {
          expect(payload.body.body.name).equal(body.name);
          done();
        });

      });

    });

    describe("group_idがoid形式ではない場合", () => {
      let payload;
      let body = {
        name: "changedGroupName"
      };
      let expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループIDが不正のためグループ名の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/invalid_oid/name`)
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
        expect(payload.body.status.errors.group_id).equal(expected.detail);
        done();
      });
    });

    describe("nameがundefinedの場合", () => {
      let payload;
      let body = {};
      let expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が空のためグループ名の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/name`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it("statusはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    describe("nameがnullの場合", () => {
      let payload;
      let body = { name: null };
      let expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が空のためグループ名の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/name`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it("statusはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    describe("nameが空文字の場合", () => {
      let payload;
      let body = { name: "" };
      let expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が空のためグループ名の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/name`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it("statusはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    describe("nameが255文字を超過する場合", () => {
      let payload;
      let body = { name: _.range(257).map(i => "1").join("") };
      let expected = {
        message: "グループ名の変更に失敗しました",
        detail: "グループ名が制限文字数(255)を超過したためグループ名の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/name`)
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

      it(`エラーの概要は「${expected.message}」`, done => {
        expect(payload.body.status.message).equal(expected.message);
        done();
      });

      it("statusはfalse", done => {
        expect(payload.body.status.success).equal(false);
        done();
      });

      it(`エラーの詳細は「${expected.detail}」`, done => {
        expect(payload.body.status.errors.name).equal(expected.detail);
        done();
      });
    });

    // グループ名についてはひとまず禁止文字対象外
    describe.skip("nameに禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", () => {
      describe("バックスラッシュ", () => {
        let payload;
        let body = { name: "\\f\\o\\o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("スラッシュ", () => {
        let payload;
        let body = { name: "/f/o/o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("コロン", () => {
        let payload;
        let body = { name: ":f:o:o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("アスタリスク", () => {
        let payload;
        let body = { name: "*f*o*o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("クエスチョン", () => {
        let payload;
        let body = { name: "?f?o?o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("山括弧開く", () => {
        let payload;
        let body = { name: "<f<o<o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("山括弧閉じる", () => {
        let payload;
        let body = { name: ">f>o>o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });

      describe("パイプ", () => {
        let payload;
        let body = { name: "|f|o|o" };
        let expected = {
          message: "グループ名の変更に失敗しました",
          detail: "グループ名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/name`)
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

        it(`エラーの概要は「${expected.message}」`, done => {
          expect(payload.body.status.message).equal(expected.message);
          done();
        });

        it("statusはfalse", done => {
          expect(payload.body.status.success).equal(false);
          done();
        });

        it(`エラーの詳細は「${expected.detail}」`, done => {
          expect(payload.body.status.errors.group_id).equal(false);
          done();
        });
      });
    });

  });

  describe("patch /:group_id/description", () => {
    let group;

    before( done => {
      request
        .get(groups_url)
        .end( (err, res) => {
          group = _.head(res.body.body);
          done();
        });
    });

    describe("正しいgroup_id, descriptionを指定した場合", () => {
      let payload;
      let body = {
        description: "changedDescription"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/description`)
          .send(body)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("変更したグループを取得した場合", () => {
        let payload;

        before( done => {
          request
            .get(groups_url + `/${group._id}`)
            .end( (err, res) => {
              payload = res;
              done();
            });
        });

        it("変更された値が反映されている", done => {
          expect(payload.body.body.description).equal(body.description);
          done();
        });
      });
    });

    describe("group_idがoid形式ではない場合", () => {
      let payload;
      let body = {
        description: "foobar"
      };
      let expected = {
        message: "グループの備考の変更に失敗しました",
        detail: "グループIDが不正のためグループの備考の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/invalid_oid/description`)
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
        expect(payload.body.status.errors.group_id).equal(expected.detail);
        done();
      });

    });

    // 備考は空でもよいので
    describe.skip("descriptionがundefinedの場合", () => {
      let payload;
      let body = {};
      let expected = {
        message: "グループの備考の更新に失敗しました",
        detail: "備考が空です"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/description`)
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
        expect(payload.body.status.errors.group_id).equal(expected.detail);
        done();
      });

    });

    // 備考は空でもよいので
    describe.skip("descriptionがnullの場合", () => {
      let payload;
      let body = { description: null };
      let expected = {
        message: "グループの備考の更新に失敗しました",
        detail: "備考が空です"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/description`)
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
        expect(payload.body.status.errors.group_id).equal(expected.detail);
        done();
      });

    });

    describe("descriptionが空文字の場合", () => {
      let payload;
      let body = { description: "" };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/description`)
          .send(body)
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      // 備考は必須項目ではない
      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });
    });

    describe("descriptionが255文字を超過する場合", () => {
      let payload;
      let body = { description: _.range(257).map( i => "1" ).join("") };
      let expected = {
        message: "グループの備考の変更に失敗しました",
        detail: "グループの備考が制限文字数(255)を超過したためグループの備考の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/${group._id}/description`)
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
        expect(payload.body.status.errors.description).equal(expected.detail);
        done();
      });
    });

    // グループ名の備考は禁止文字対象外
    describe.skip("descriptionに禁止文字(\\, / , :, *, ?, <, >, |)が含まれている場合", () => {
      describe("バックスラッシュ", () => {
        let payload;
        let body = { description: "\\foo\\bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("スラッシュ", () => {
        let payload;
        let body = { description: "/foo/bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("コロン", () => {
        let payload;
        let body = { description: ":foo:bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("アスタリスク", () => {
        let payload;
        let body = { description: "*foo*bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("クエスチョン", () => {
        let payload;
        let body = { description: "?foo?bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("山括弧開く", () => {
        let payload;
        let body = { description: "<foo<bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("山括弧閉じる", () => {
        let payload;
        let body = { description: ">foo>bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });

      describe("パイプ", () => {
        let payload;
        let body = { description: "|foo|bar" };
        let expected = {
          message: "グループの備考の更新に失敗しました",
          detail: "備考に禁止文字(\\, / , :, *, ?, <, >, |)が含まれています"
        };

        before( done => {
          request
            .patch(groups_url + `/${group._id}/description`)
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
          expect(payload.body.status.errors.group_id).equal(expected.detail);
          done();
        });
      });
    });
  });

  describe("patch /:group_id/role_menus", () => {
    let role_menu_id;
    let group_id;

    before( done => {
      new Promise( (resolve, reject) => {
        request
          .get(groups_url)
          .end( (err, res) => resolve(res) );
      }).then( res => {
        group_id = _.head(res.body.body)._id;

        return new Promise( (resolve, reject) => {
          request
            .get("/api/v1/role_menus")
            .end( (err, res) => resolve(res) );
        });

      }).then( res => {
        role_menu_id = _.head(res.body.body)._id;
        done();
      });
    });

    describe("正しいgroup_id, role_menu_idを指定した場合", () => {
      let payload;

      before( done => {
        request
          .patch(groups_url + `/${group_id}/role_menus`)
          .send({ role_menu_id })
          .end( (err, res) => {
            payload = res;
            done();
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("変更したグループを取得した場合", () => {
        let payload;

        before( done => {
          request
            .get(groups_url + `/${group_id}`)
            .end( (err, res) => {
              payload = res;
              done();
            });
        });

        it("変更した値が反映されている(未実装？？)", done => {
          expect(true).equal(true);
          done();
        });

      });
    });

    describe("group_idがoid形式ではない場合", () => {
      let payload;
      let expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "グループIDが不正のためグループのメニュー権限の変更に失敗しました"
      };

      before( done => {
        request
          .patch(groups_url + `/invalid_oid/role_menus`)
          .send({ role_menu_id })
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

    describe("role_menu_idがoid形式ではない場合", () => {
      let payload;
      let expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "指定されたメニュー権限IDが不正のためグループのメニュー権限の変更に失敗しました"
      };
      let body = {
        role_menu_id: "invalid_role_menu_id"
      };

      before( done => {
        request
          .patch(groups_url + `/${group_id}/role_menus`)
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

    describe("role_menu_idがundefinedの場合", () => {
      let payload;
      let expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "メニュー権限IDが空のためグループのメニュー権限の変更に失敗しました"
      };
      let body = {};

      before( done => {
        request
          .patch(groups_url + `/${group_id}/role_menus`)
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

    describe("role_menu_idがnullの場合", () => {
      let payload;
      let expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "メニュー権限IDが空のためグループのメニュー権限の変更に失敗しました"
      };
      let body = {
        role_menu_id: null
      };

      before( done => {
        request
          .patch(groups_url + `/${group_id}/role_menus`)
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

    describe("role_menu_idが空文字の場合", () => {
      let payload;
      let expected = {
        message: "グループのメニュー権限の変更に失敗しました",
        detail: "メニュー権限IDが空のためグループのメニュー権限の変更に失敗しました"
      };
      let body = {
        role_menu_id: ""
      };

      before( done => {
        request
          .patch(groups_url + `/${group_id}/role_menus`)
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
