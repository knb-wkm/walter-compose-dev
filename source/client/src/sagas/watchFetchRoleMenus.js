import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/menus";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchRoleMenus() {
  while (true) {
    yield take(actions.requestFetchRoleMenus().type);
    const api = new API();
    yield put(commons.loadingStart());
    try {
      const payload = yield call(api.fetchRoleMenus);
      yield put(actions.initRoleMenus(payload.data.body));
    }
    catch(e) {
      const { message, errors } = errorParser(e,"一覧の取得に失敗しました");
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

export default watchFetchRoleMenus;