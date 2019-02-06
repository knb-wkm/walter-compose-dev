import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchToggleUser() {
  while (true) {
    const task = yield take(actions.toggleUser().type);
    const api = new API();

    try {
      yield put(commonActions.loadingStart());
      yield call(api.toggleUser, task.user_id);
      const payload = yield call(api.fetchUser, task.user_id);
      const user = payload.data.body;
      yield put(actions.initUser(user));
      const message = user.enabled === true
            ? "ユーザを有効に変更しました"
            : "ユーザを無効に変更しました";
      yield put(commonActions.triggerSnackbar(message));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ユーザの有効化/無効化に失敗しました");
      yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
    }
    finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchToggleUser;
