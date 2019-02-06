import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/index";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchMoreNotification(){
  while(true) {
    yield take(actions.requestFetchMoreNotification().type);
    const state = yield select();
    const nextPage = parseInt( state.notifications.page ) + 1;
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchNotification, nextPage);
      const readPayload = yield call(api.updateNotificationsRead, payload.data.body);
      const status = { ...readPayload.data.status,
        page: payload.data.status.page
      };
      yield put(actions.initMoreNotificaiton(payload.data.body, status));
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

export default watchFetchMoreNotification;