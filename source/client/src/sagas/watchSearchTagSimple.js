import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/tags";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSearchTagSimple() {
  while (true) {
    const { keyword } = yield take(actions.searchTagSimple().type);
    const api = new API();
    yield put(commonActions.loadingStart());

    try {
      const payload = yield call(api.searchTagSimple, keyword);
      yield put(actions.initTags(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"一覧の取得に失敗しました");
      yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
    }
    finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchSearchTagSimple;
