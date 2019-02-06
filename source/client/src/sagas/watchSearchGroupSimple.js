import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/groups";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSearchGroupSimple() {
  while (true) {
    const { keyword } = yield take(actions.searchGroupSimple().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.searchGroupSimple, keyword);
      yield put(actions.initGroups(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"一覧の取得に失敗しました");
      yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchSearchGroupSimple;
