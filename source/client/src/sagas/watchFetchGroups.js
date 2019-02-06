import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/groups";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchGroups() {
  while (true) {
    const task = yield take(actions.requestFetchGroups().type);
    const api = new API();

    try {
      yield put(commons.loadingStart());
      const payload = yield call(api.fetchGroup, task.tenant_id);
      yield put(actions.initGroups(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"グループの取得に失敗しました");
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

export default watchFetchGroups;

