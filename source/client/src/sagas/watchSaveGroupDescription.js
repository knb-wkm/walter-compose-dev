import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/groups";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveGroupDescription() {
  while (true) {
    const task = yield take(actions.saveGroupDescription().type);
    const api = new API();
    yield put(actions.clearGroupValidationError());

    try {
      yield put(commons.loadingStart());
      yield call(api.saveGroupDescription, task.group);
      const payload = yield call(api.fetchGroupById, task.group._id);
      yield put(actions.initGroup(payload.data.body));
      yield put(commons.triggerSnackbar("グループの備考を変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"グループの備考の変更に失敗しました");
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

export default watchSaveGroupDescription;
