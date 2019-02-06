import { delay } from "redux-saga";
import { put, take, call } from "redux-saga/effects";

import * as commons from "../actions/commons";

function* watchTriggerSnackbar() {
  while (true) {
    const { message } = yield take(commons.triggerSnackbar().type);

    yield put(commons.initSnackbar(message));
    yield call(delay, 3000);
    yield put(commons.closeSnackbar());
  }
}

export default watchTriggerSnackbar;
