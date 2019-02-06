import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";


function* watchDeleteRole() {
  while (true) {
    const task = yield take(actions.deleteRole().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.deleteRole, task.role);
      const payload = yield call(api.fetchRoles);
      yield put(actions.initRoles(payload.data.body));
      yield task.history.push("/roles");
      yield put(commons.loadingEnd());
      yield put(commons.triggerSnackbar("ロールを削除しました"));
    }
    catch (e) {
      console.log(e);
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDeleteRole;
