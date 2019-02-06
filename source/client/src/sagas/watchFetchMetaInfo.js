import { call, put, take } from "redux-saga/effects";

import * as actions from "../actions";
import * as commons from "../actions/commons";
import { API } from "../apis";
import errorParser from "../helper/errorParser";

function* watchFetchMetaInfo() {
  while (true) {
    const { meta_id } = yield take(actions.requestFetchMetaInfo().type);
    const api = new API();

    yield put(actions.loadingStart());

    try {
      const payload = yield call(api.fetchMetaInfo, meta_id);
      yield put(actions.initMetaInfo(payload.data.body));
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
      yield put(actions.loadingEnd());
    }
  }
}

export default watchFetchMetaInfo;
