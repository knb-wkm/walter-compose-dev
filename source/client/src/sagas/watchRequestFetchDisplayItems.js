import { put, take, call } from "redux-saga/effects";

import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchRequestFetchDisplayItems() {

  while (true) {
    yield take(actions.requestFetchDisplayItems().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchDisplayItems);
      yield put(actions.initDisplayItems(payload.data.body));
      yield put(commons.loadingEnd());
    }
    catch (e) {
      const { message, errors } = errorParser(e,"表示項目の取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
  }
}

export default watchRequestFetchDisplayItems;
