import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchUsers() {
  while (true) {
    yield take(actions.requestFetchUsers().type);
    const api = new API();
    yield put(commonActions.loadingStart());

    try {
      const payload = yield call(api.fetchUsers);
      yield put(actions.initUsers(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ユーザ一覧の取得に失敗しました");
      if(!errors.unknown){
        yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commonActions.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commonActions.loadingEnd());
    }

  }
}

export default watchFetchUsers;
