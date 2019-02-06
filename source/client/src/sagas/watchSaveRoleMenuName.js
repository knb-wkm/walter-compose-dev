import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/menus";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveRoleMenuName() {
  while (true) {
    const task = yield take(actions.saveRoleMenuName().type);
    const api = new API();
    yield put(commons.loadingStart());
    yield put(actions.clearRoleMenuValidationError());

    try {
      yield call(api.saveRoleMenuName, task.roleMenu);
      const payload = yield call(api.fetchRoleMenu, task.roleMenu._id);
      yield put(actions.initRoleMenu(payload.data.body));
      yield put(commons.triggerSnackbar("表示名を変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"表示名の変更に失敗しました");
      if(!errors.unknown){
        if (!errors.name) {
          yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
        }else{
          yield put(actions.saveRoleMenuValidationError(errors));
        }
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchSaveRoleMenuName;
