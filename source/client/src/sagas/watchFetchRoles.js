import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchRoles() {
  while (true) {
    yield take(actions.requestFetchRoles().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchRoles);
      yield put(actions.initRoles(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロールの取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchFetchRoles;
