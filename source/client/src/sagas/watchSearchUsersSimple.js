import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSearchUsersSimple() {
  while (true) {
    const task = yield take(actions.searchUsersSimple().type);
    const api = new API();
    yield put(commonActions.loadingStart());

    try {
      const payload = yield call(api.searchUsersSimple, task.tenant_id, task.keyword);
      yield put(actions.initUsers(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"一覧の取得に失敗しました");
      yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
    }
    finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchSearchUsersSimple;
