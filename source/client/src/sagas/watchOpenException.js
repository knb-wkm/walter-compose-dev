import { delay } from "redux-saga";
import { put, take, call } from "redux-saga/effects";

import * as commons from "../actions/commons";

function* watchOpenException() {
  while (true) {
    const { message, detail } = yield take(commons.openException().type);

    yield put(commons.initException(message, detail));
    yield call(delay, 3000);
    yield put(commons.closeException());
  }
}

export default watchOpenException;
