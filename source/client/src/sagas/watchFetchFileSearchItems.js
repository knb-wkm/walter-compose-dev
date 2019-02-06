import { call, put, take } from "redux-saga/effects";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";

import { API } from "../apis";
import errorParser from "../helper/errorParser";

function* watchFetchFileSearchItems() {
  while (true) {
    yield take(actions.requestFetchFileSearchItems().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchFileSearchItems);
      yield put(actions.initFileDetailSearchItems(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"検索項目の取得に失敗しました");
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

export default watchFetchFileSearchItems;
