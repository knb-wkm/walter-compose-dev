import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/menus";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchRoleMenu() {
  while (true) {
    const task = yield take(actions.requestFetchRoleMenu().type);
    const api = new API();
    yield put(commons.loadingStart());
    try {
      const payload = yield call(api.fetchRoleMenu, task.menu_id);
      yield put(actions.initRoleMenu(payload.data.body));
    }
    catch(e) {
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

export default watchFetchRoleMenu;