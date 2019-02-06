import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/menus";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";


function* watchDeleteRoleMenu() {
  while (true) {
    const task = yield take(actions.deleteRoleMenu().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.deleteRoleMenu, task.roleMenu);
      const payload = yield call(api.fetchRoleMenus);
      yield put(actions.initRoleMenus(payload.data.body));
      yield task.history.push("/role_menus");
      yield put(commons.triggerSnackbar("ロールを削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロールの削除に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[Object.keys(errors)[0]]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDeleteRoleMenu;
