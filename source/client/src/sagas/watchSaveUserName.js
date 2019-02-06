import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveUserName() {
  while (true) {
    const task = yield take(actions.saveUserName().type);
    const api = new API();
    yield put(actions.clearUserValidationError());

    try {
      yield put(commonActions.loadingStart());
      yield call(api.saveUserName, task.user);
      const payload = yield call(api.fetchUser, task.user._id);
      yield put(actions.initUser(payload.data.body));
      yield put(commonActions.triggerSnackbar("表示名を変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"表示名の変更に失敗しました");
      if(errors.name !== undefined){
        yield put(actions.changeUserValidationError(errors));
      }else{
        yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
      }
    }finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchSaveUserName;
