import { put, take } from "redux-saga/effects";

import * as actions from "../actions";
import * as actionTypes from "../actionTypes";

function* watchLogout() {
  while (true) {
    yield take(actionTypes.LOGOUT);
    localStorage.removeItem("token");

    yield put(actions.logout());
    yield put(actions.triggerSnackbar("ログアウトしました"));
  }
}

export default watchLogout;
