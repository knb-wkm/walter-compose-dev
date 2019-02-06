import { all, call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchUser() {
  while (true) {
    const task = yield take(actions.requestFetchUser().type);
    const api = new API();
    yield put(commonActions.loadingStart());

    try {
      const [user, group] = yield all([
        call(api.fetchUser, task.user_id),
        call(api.fetchGroup, task.tenant_id)
      ]);

      yield put(actions.initUser(user.data.body));
      yield put(actions.initGroups(group.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ユーザ情報の取得に失敗しました");
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

export default watchFetchUser;
