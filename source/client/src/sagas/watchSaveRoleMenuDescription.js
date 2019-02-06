import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/menus";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveRoleMenuDescription() {
  while (true) {
    const task = yield take(actions.saveRoleMenuDescription().type);
    const api = new API();
    yield put(commons.loadingStart());
    yield put(actions.clearRoleMenuValidationError());

    try {
      yield call(api.saveRoleMenuDescription, task.roleMenu);
      const payload = yield call(api.fetchRoleMenu, task.roleMenu._id);
      yield put(actions.initRoleMenu(payload.data.body));
      yield put(commons.triggerSnackbar("備考を変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"備考の変更に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchSaveRoleMenuDescription;
