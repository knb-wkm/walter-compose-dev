import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveRoleName() {
  while (true) {
    const task = yield take(actions.saveRoleName().type);
    const api = new API();
    yield put(commons.loadingStart());
    yield put(actions.clearRoleValidationError());

    try {
      yield call(api.saveRoleName, task.role);
      const payload = yield call(api.fetchRole, task.role._id);
      yield put(actions.initRole(payload.data.body));
      yield put(commons.triggerSnackbar("ロール名を変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロール名の変更に失敗しました");
      if(errors.name !== undefined){
        yield put(actions.saveRoleValidationError(errors));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }

    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchSaveRoleName;
