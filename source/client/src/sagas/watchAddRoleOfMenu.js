import { call, put, take }  from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/menus";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchAddRoleOfMenu() {
  while (true) {
    const task = yield take(actions.addRoleOfMenu().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.addRoleOfMenu, task.role_id, task.menu_id);
      const payload = yield call(api.fetchRoleMenu, task.role_id);
      yield put(actions.initRoleMenu(payload.data.body));
      yield put(commons.triggerSnackbar("ロールにアクションを追加しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"アクションの追加に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors.menu));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchAddRoleOfMenu;
