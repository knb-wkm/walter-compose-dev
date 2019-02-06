import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";


function* watchDeleteRole() {
  while (true) {
    const task = yield take(actions.deleteRole().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.deleteRole, task.role);
      const payload = yield call(api.fetchRoles);
      yield put(actions.initRoles(payload.data.body));
      yield task.history.push("/role_files");
      yield put(commons.triggerSnackbar("ロールを削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロールの削除に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors.role));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDeleteRole;
