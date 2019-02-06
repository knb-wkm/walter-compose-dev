import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";


function* watchSaveUserPasswordForce() {
  while (true) {
    const task = yield take(actions.saveUserPasswordForce().type);
    const api = new API();
    yield put(actions.clearUserValidationError());

    try {
      yield put(commonActions.loadingStart());
      yield call(api.saveUserPasswordForce, task.user);
      const payload = yield call(api.fetchUser, task.user._id);
      yield put(actions.initUser(payload.data.body));
      yield put(commonActions.triggerSnackbar("パスワードを変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"パスワードの変更に失敗しました");
      if(errors.password !== undefined){
        yield put(actions.changeUserValidationError(errors));
      }else{
        yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
      }
    } finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchSaveUserPasswordForce;
