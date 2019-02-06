import supertest from "supertest";
import defaults from "superagent-defaults";
import { expect } from "chai";
import mongoose from "mongoose";
import Router from "../";
import { isArray, first, has, findIndex, isString, isMatch } from "lodash";
import { app, mongoUrl, initdbPromise, authData } from "./builder";

mongoose.connect(mongoUrl, { useMongoClient: true });
app.use('/', Router);

const base_url = "/api/v1/menus";
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

      it('返却値はobjectである',done => {
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
