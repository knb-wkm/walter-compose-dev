import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchAppSettings() {
  while(true) {
    const task = yield take(actions.requestFetchAppSettings().type);
    const api = new API();
    yield put(commonActions.loadingStart());
    
    try {
      const payload = yield call(api.fetchAppSettings);
      yield put(actions.initAppSettings(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e, "テナント設定の取得に失敗しました");
      if (! errors.unknown) {
        yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
      } else {
        yield put(commonActions.openException(message, errors.unknown));
      }
    }
    finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchFetchAppSettings;
