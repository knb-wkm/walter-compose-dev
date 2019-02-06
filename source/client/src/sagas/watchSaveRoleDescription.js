import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveRoleDescription() {
  while (true) {
    const task = yield take(actions.saveRoleDescription().type);
    const api = new API();
    yield put(commons.loadingStart());
    yield put(actions.clearRoleValidationError());

    try {
      yield call(api.saveRoleDescription, task.role);
      const payload = yield call(api.fetchRole, task.role._id);
      yield put(actions.initRole(payload.data.body));
      yield put(commons.triggerSnackbar("ロールの備考を変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロールの備考の変更に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ] ));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchSaveRoleDescription;
