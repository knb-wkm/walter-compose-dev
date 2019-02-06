import { call, put, take } from "redux-saga/effects";
import moment from "moment";
import { API } from "../apis";

import * as actions from "../actions/analysises";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchAnalysisPeriod() {
  while (true) {
    let { start_date, end_date } = yield take(actions.requestFetchAnalysisPeriod().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      start_date = moment(start_date).format("YYYYMMDD");
      end_date = moment(end_date).format("YYYYMMDD");
      const payload = yield call(api.fetchAnalysisPeriod, start_date, end_date);
      yield put(actions.initAnalysisPeriod(payload.data.body));
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

export default watchFetchAnalysisPeriod;
