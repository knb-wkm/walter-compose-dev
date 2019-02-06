import { call, put, take } from "redux-saga/effects";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

import { API } from "../apis";

function* watchFetchMetaInfos() {
  while (true) {
    yield take(actions.requestFetchMetaInfos().type);
    const api = new API();

    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchMetaInfos);
      yield put(actions.initMetaInfos(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"メタ情報の取得に失敗しました");
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

export default watchFetchMetaInfos;
