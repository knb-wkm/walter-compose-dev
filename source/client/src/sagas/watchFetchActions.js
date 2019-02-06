import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchActions() {
  while (true) {
    yield take(actions.requestFetchActions().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchActions);
      yield put(actions.initActions(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"アクション一覧の取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, JSON.stringify(errors)));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchFetchActions;
