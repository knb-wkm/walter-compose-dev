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

const files_url = "/api/v1/files";
const login_url = "/api/login";

const request = defaults(supertest(app));
let user;

describe(files_url, () => {

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
        const user_id = res.body.body.user._id;

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

  describe("post /", () => {
    describe("基本的な情報のみをアップロード(単数)(正常系)", () => {
      let payload;
      let body;

      before( done => {
        body = {
          dir_id: user.tenant.home_dir_id,
          files: [
            {
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }
          ]
        };

        request
          .post(files_url)
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

      describe("アップロードしたファイルを取得した場合", () => {
        let nextPayload;

        before( done => {
          const file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request
            .get(files_url + `/${file_id}`)
            .end( (err, res) => {
              nextPayload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(nextPayload.status).equal(200);
          done();
        });

        it("nameが指定した値で保存されている", done => {
          expect(nextPayload.body.body.name).equal(_.head(body.files).name);
          done();
        });

        it("sizeが指定した値で保存されている", done => {
          expect(nextPayload.body.body.size).equal(_.head(body.files).size);
          done();
        });

        it("mime_typeが指定した値で保存されている", done => {
          expect(nextPayload.body.body.mime_type).equal(_.head(body.files).mime_type);
          done();
        });
      });
    });

    describe("基本的な情報のみをアップロード(複数)(正常系)", () => {
      let payload;
      let body;

      before( done => {
        body = {
          dir_id: user.tenant.home_dir_id,
          files: [
            {
              name: "multiple_files_01.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            },
            {
              name: "multiple_files_02.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }
          ]
        };

        request
          .post(files_url)
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
      
      describe("アップロードしたファイルを取得した場合", () => {
        let nextPayload;

        before( done => {
          const file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request
            .get(files_url + `/${file_id}`)
            .end( (err, res) => {
              nextPayload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(nextPayload.status).equal(200);
          done();
        });

        it("nameが指定した値で保存されている", done => {
          expect(nextPayload.body.body.name).equal(_.head(body.files).name);
          done();
        });

        it("sizeが指定した値で保存されている", done => {
          expect(nextPayload.body.body.size).equal(_.head(body.files).size);
          done();
        });

        it("mime_typeが指定した値で保存されている", done => {
          expect(nextPayload.body.body.mime_type).equal(_.head(body.files).mime_type);
          done();
        });
      });
    });

    describe("基本的な情報のみアップード(異常系)", () => {
      describe("nameが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "ファイル名が空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  // name: "test.txt",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].name)
              .equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "ファイル名が空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: null,
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].name)
              .equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "ファイル名が空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].name)
              .equal(expected.detail);
            done();
          });
        });

        describe("禁止文字(\\, / , :, *, ?, <, >, |)を含んでいる場合", () => {
          describe("バックスラッシュ", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };

            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: "\\foo\\bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });
          });

          describe("スラッシュ", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };

            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: "/foo/bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });
          });

          describe("コロン", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: ":foo:bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });

          });

          describe("アスタリスク", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: "*foo*bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });
          });

          describe("クエスチョン", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: "?foo?bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });
          });

          describe("山括弧開く", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: "<foo<bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });
          });

          describe("山括弧閉じる", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: ">foo>bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });
          });

          describe("パイプ", () => {
            let payload;
            let expected = {
              message: "ファイルのアップロードに失敗しました",
              detail: "ファイル名に禁止文字(\\, / , :, *, ?, <, >, |)が含まれているためファイルのアップロードに失敗しました"
            };
            let body;

            before( done => {
              body = {
                dir_id: user.tenant.home_dir_id,
                files: [
                  {
                    name: "|foo|bar",
                    size: 4,
                    mime_type: "text/plain",
                    base64: "data:text/plain;base64,Zm9vCg==",
                    checksum: "8f3bee6fbae63be812de5af39714824e"
                  }
                ]
              };

              request
                .post(files_url)
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

            it(`メッセージの概要は「${expected.message}」`, done => {
              expect(payload.body.status.message).equal(expected.message);
              done();
            });

            it(`メッセージの詳細は「${expected.detail}」`, done => {
              expect(payload.body.status.errors[0].name)
                .equal(expected.detail);
              done();
            });
          });
        });
      });

      describe("sizeが", () => {
        describe.skip("数値以外の場合", () => {
        });
      });

      describe("mime_typeが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "mime_typeが空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "mime_type_is_undefined_01.txt",
                  size: 4,
                  // mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].mime_type)
              .equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "mime_typeが空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "mime_type_is_null_01.txt",
                  size: 4,
                  // mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].mime_type)
              .equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "mime_typeが空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "mime_type_is_empty_01.txt",
                  size: 4,
                  // mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].mime_type)
              .equal(expected.detail);
            done();
          });
        });

      });

      describe("checksumが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "checksumが空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "checksum_is_invalid_01.txt",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg=="
                  // checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].checksum)
              .equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "checksumが空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "checksum_is_invalid_01.txt",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: null
                  // checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].checksum)
              .equal(expected.detail);
            done();
          });
        });

        describe("一致しない場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "checksumが不正のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "checksum_is_invalid_01.txt",
                  size: 4,
                  mime_type: "text/plain",
                  base64: "data:text/plain;base64,Zm9vCg==",
                  // checksum: "8f3bee6fbae63be812de5af39714824e"
                  checksum: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].checksum)
              .equal(expected.detail);
            done();
          });
        });
      });

      describe("base64が", () => {
        describe("undefinedの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "checksum_is_invalid_01.txt",
                  size: 4,
                  mime_type: "text/plain",
                  // base64: "data:text/plain;base64,Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].base64)
              .equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "checksum_is_invalid_01.txt",
                  size: 4,
                  mime_type: "text/plain",
                  // base64: "data:text/plain;base64,Zm9vCg==",
                  base64: null,
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].base64)
              .equal(expected.detail);
            done();
          });
        });

        describe("空の場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が空のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "checksum_is_invalid_01.txt",
                  size: 4,
                  mime_type: "text/plain",
                  // base64: "data:text/plain;base64,Zm9vCg==",
                  base64: "",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].base64)
              .equal(expected.detail);
            done();
          });
        });

        describe("DataURI形式ではない場合", () => {
          let payload;
          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "base64が不正のためファイルのアップロードに失敗しました"
          };

          let body;

          before( done => {
            body = {
              dir_id: user.tenant.home_dir_id,
              files: [
                {
                  name: "checksum_is_invalid_01.txt",
                  size: 4,
                  mime_type: "text/plain",
                  // base64: "data:text/plain;base64,Zm9vCg==",
                  base64: "Zm9vCg==",
                  checksum: "8f3bee6fbae63be812de5af39714824e"
                }
              ]
            };

            request
              .post(files_url)
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

          it(`メッセージの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`メッセージの詳細は「${expected.detail}」`, done => {
            expect(payload.body.status.errors[0].base64)
              .equal(expected.detail);
            done();
          });
        });

      });
    });

    describe("ファイル名が重複する場合", () => {
      it("dummy");
    });

    describe("メタ情報を指定した場合(正常系)", () => {
      let payload;
      let metainfo;
      let body = {
        files: [
          {
            name: "test.txt",
            size: 4,
            mime_type: "text/plain",
            base64: "data:text/plain;base64,Zm9vCg==",
            checksum: "8f3bee6fbae63be812de5af39714824e"
          }
        ]
      };

      before( done => {
        request
          .get("/api/v1/meta_infos")
          .end( (err, res) => {
            const _meta = _.find(res.body.body, { value_type: "String" });

            metainfo = {
              _id: _meta._id,
              value: "metainfo value"
            };

            body.files[0].meta_infos = [metainfo];
            body.dir_id = user.tenant.home_dir_id;

            request
              .post(files_url)
              .send(body)
              .end( (err, res) => {
                payload = res;
                done();
              });
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("アップロードしたファイルを取得した場合", () => {
        let nextPayload;

        before( done => {
          const file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request
            .get(files_url + `/${file_id}`)
            .end( (err, res) => {
              nextPayload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(nextPayload.status).equal(200);
          done();
        });

        it("meta_infosが指定した値で保存されている", done => {
          const payloadMetainfo = _.get(nextPayload, ["body", "body", "meta_infos", "0"]);
          const postMetainfo = _.get(body, ["files", "0", "meta_infos", "0"]);

          expect(payloadMetainfo._id).equal(postMetainfo._id);
          expect(payloadMetainfo.value).equal(postMetainfo.value);
          done();
        });

      });
    });

    describe("メタ情報を指定した場合(異常系)", () => {
      describe("metainfo_idが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [
                {
                  // _id: ""
                  value: "foobar"
                }
              ]
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [
                {
                  _id: null,
                  value: "foobar"
                }
              ]
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;

            request
              .post(files_url)
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [
                {
                  _id: "",
                  value: "foobar"
                }
              ]
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [
                {
                  _id: "invalid_oid",
                  value: "foobar"
                }
              ]
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "メタ情報IDが不正のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("指定されたmetainfo_idがマスタに存在しない場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e",
              meta_infos: [
                {
                  _id: (new ObjectId).toString(),
                  value: "foobar"
                }
              ]
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報が存在しないためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });
      });

      describe("valueが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .get("/api/v1/meta_infos")
              .end( (err, res) => {
                metainfo = {
                  _id: _.get(res, ["body", "body", "0", ""])
                };
                body.files[0].meta_infos = [metainfo];

                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => {
                    payload = res;
                    done();
                  });
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            expect(_err).equal(expected.detail);
            done();
          });

        });

        describe("nullの場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .get("/api/v1/meta_infos")
              .end( (err, res) => {
                metainfo = {
                  _id: _.get(res, ["body", "body", "0", ""]),
                  value: null
                };
                body.files[0].meta_infos = [metainfo];

                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => {
                    payload = res;
                    done();
                  });
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .get("/api/v1/meta_infos")
              .end( (err, res) => {
                metainfo = {
                  _id: _.get(res, ["body", "body", "0", ""]),
                  value: ""
                };
                body.files[0].meta_infos = [metainfo];

                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => {
                    payload = res;
                    done();
                  });
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("日付型ではない場合", () => {
          let payload;
          let metainfo;
          let body = {
            files: [{
              name: "test.txt",
              size: 4,
              mime_type: "text/plain",
              base64: "data:text/plain;base64,Zm9vCg==",
              checksum: "8f3bee6fbae63be812de5af39714824e"
            }]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたメタ情報の値が日付型ではないためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .get("/api/v1/meta_infos")
              .end( (err, res) => {
                const date_meta = _.find(res.body.body, { value_type: "Date" });

                metainfo = {
                  _id: date_meta._id,
                  value: "invalid_date"
                };

                body.files[0].meta_infos = [metainfo];

                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => {
                    payload = res;
                    done();
                  });
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
            const _err = _.get(payload, ["body", "status", "errors", "0", "meta_info_value"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });
      });
    });

    describe("タグを指定した場合(正常系)", () => {
      let payload;
      let tag;
      let body = {
        files: [
          {
            name: "test.txt",
            size: 4,
            mime_type: "text/plain",
            base64: "data:text/plain;base64,Zm9vCg==",
            checksum: "8f3bee6fbae63be812de5af39714824e"
          }
        ]
      };

      before( done => {
        body.dir_id = user.tenant.home_dir_id;
        request
          .get("/api/v1/tags")
          .end( (err, res) => {
            tag = _.get(res, ["body", "body", "0", "_id"]);

            body.files[0].tags = [tag];

            request
              .post(files_url)
              .send(body)
              .end( (err, res) => {
                payload = res;
                done();
              });
          });
      });

      it("http(200)が返却される", done => {
        expect(payload.status).equal(200);
        done();
      });

      describe("アップロードしたファイルを取得した場合", () => {
        let nextPayload;

        before( done => {
          const file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request
            .get(files_url + `/${file_id}`)
            .end( (err, res) => {
              nextPayload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(nextPayload.status).equal(200);
          done();
        });

        it("tagsが指定した値で保存されている", done => {
          const payloadTag = _.get(nextPayload, ["body", "body", "tags", "0", "_id"]);
          const postTag = _.get(body, ["files", "0", "tags", "0"]);

          expect(payloadTag).equal(postTag);
          done();
        });

      });
    });

    describe("タグを指定した場合(異常系)", () => {
      describe("tag_idが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e",
                tags: [undefined]
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("nullの場合", () => {
          let payload;
          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e",
                tags: [ null ]
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", () => {
          let payload;
          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e",
                tags: [ "" ]
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたタグIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", () => {
          let payload;
          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e",
                tags: [ "invalid_oid" ]
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "タグIDが不正のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("tagがマスタに存在しない場合", () => {
          let payload;
          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e",
                tags: [ ObjectId() ]
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "タグIDが不正のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            request
              .post(files_url)
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

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "tag_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

      });
    });

    describe("ロールを指定した場合(正常系)", () => {
      let payload;
      let role_file_id;
      let user_id;

      let body = {
        files: [
          {
            name: "test.txt",
            size: 4,
            mime_type: "text/plain",
            base64: "data:text/plain;base64,Zm9vCg==",
            checksum: "8f3bee6fbae63be812de5af39714824e"
          }
        ]
      };

      before( done => {
        body.dir_id = user.tenant.home_dir_id;

        new Promise( (resolve, reject) => {

          request
            .get("/api/v1/role_files")
            .end( (err, res) => resolve(res) );

        }).then( res => {
          role_file_id = _.get(res, ["body", "body", "0", "_id"]);

          return new Promise( (resolve, reject) => {
            request
              .get("/api/v1/users")
              .end( (err, res) => resolve(res) );
          });

        }).then( res => {
          user_id = _.get(res, ["body", "body", "0", "_id"]);

          body.files[0].authorities = [
            { role_files: role_file_id, users: user_id }
          ];

          return new Promise( (resolve, reject) => {
            request
              .post(files_url)
              .send(body)
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

      describe("アップロードしたファイルを取得した場合", () => {
        let nextPayload;

        before( done => {
          const file_id = _.get(payload, ["body", "body", "0", "_id"]);

          request
            .get(files_url + `/${file_id}`)
            .end( (err, res) => {
              nextPayload = res;
              done();
            });
        });

        it("http(200)が返却される", done => {
          expect(nextPayload.status).equal(200);
          done();
        });

        it("ロールが指定した値で保存されている", done => {
          expect( _.findIndex(nextPayload.body.body.authorities,
            {
              role_files:{_id: role_file_id},
              users:{_id: user_id}
            }
          ) >= 0).equal(true);
          done();
        });

      });
    });

    describe("ロールを指定した場合(異常系)", () => {
      describe("role_file_idが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;

            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/users")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: undefined, users: user_id }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });
        describe("nullの場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/users")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: null, users: user_id }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/users")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: "", users: user_id }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールIDが不正のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/users")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: "invalid_oid", users: user_id }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("role_idがマスタに存在しない場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたロールが存在しないためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;

            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/users")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              user_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: (new ObjectId).toString(), users: user_id }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_file_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });
      });

      describe("user_idが", () => {
        describe("undefinedの場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;

            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/role_files")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: role_file_id, users: undefined }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            expect(_err).equal(expected.detail);
            done();
          });

        });

        describe("nullの場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;

            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/role_files")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: role_file_id, users: null }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("空文字の場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが空のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/role_files")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: role_file_id, users: "" }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("mongoのoid形式ではない場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザIDが不正のためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;
            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/role_files")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: role_file_id, users: "invalid_oid" }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });

        describe("user_idがマスタに存在しない場合", () => {
          let payload;
          let role_file_id;
          let user_id;

          let body = {
            files: [
              {
                name: "test.txt",
                size: 4,
                mime_type: "text/plain",
                base64: "data:text/plain;base64,Zm9vCg==",
                checksum: "8f3bee6fbae63be812de5af39714824e"
              }
            ]
          };

          let expected = {
            message: "ファイルのアップロードに失敗しました",
            detail: "指定されたユーザが存在しないためファイルのアップロードに失敗しました"
          };

          before( done => {
            body.dir_id = user.tenant.home_dir_id;

            new Promise( (resolve, reject) => {

              request
                .get("/api/v1/role_files")
                .end( (err, res) => resolve(res) );

            }).then( res => {
              role_file_id = _.get(res, ["body", "body", "0", "_id"]);

              body.files[0].authorities = [
                { role_files: role_file_id, users: (new ObjectId).toString() }
              ];

              return new Promise( (resolve, reject) => {
                request
                  .post(files_url)
                  .send(body)
                  .end( (err, res) => resolve(res) );

              });
            }).then( res => {
              payload = res;
              done();
            });
          });

          it("http(400)が返却される", done => {
            expect(payload.status).equal(400);
            done();
          });

          it("successはfalse", done => {
            expect(payload.body.status.success).equal(false);
            done();
          });

          it(`エラーの概要は「${expected.message}」`, done => {
            expect(payload.body.status.message).equal(expected.message);
            done();
          });

          it(`エラーの詳細は「${expected.detail}」`, done => {
            const _err = _.get(payload, ["body", "status", "errors", "0", "role_user_id"]);
            expect(_err).equal(expected.detail);
            done();
          });
        });
      });
    });

  });
});



