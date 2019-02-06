import { call, put, take } from "redux-saga/effects";
import moment from "moment";
import { API } from "../apis";

import * as actions from "../actions/analysises";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchAnalysis() {
  while (true) {
    const { reported_at } = yield take(actions.requestFetchAnalysis().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const _reported_at = moment(reported_at).format("YYYYMMDD");
      const payload = yield call(api.fetchAnalysis, _reported_at);
      yield put(actions.initAnalysis(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"解析結果の取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchFetchAnalysis;
