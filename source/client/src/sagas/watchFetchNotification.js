import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/index";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchNotification(){
  while(true) {
    yield take(actions.requestFetchNotification().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchNotification);
      yield put(actions.initNotificaiton(payload.data.body, payload.data.status));
    } catch (e) {
      const { message, errors } = errorParser(e,"お知らせの取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }

    }
    finally{
      yield put(commons.loadingEnd());
    }
  }
}

export default watchFetchNotification;