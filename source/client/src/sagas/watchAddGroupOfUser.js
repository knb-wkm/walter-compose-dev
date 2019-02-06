import { call, put, take, all } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchAddGroupOfUser() {
  while (true) {
    const task = yield take(actions.addGroupOfUser().type);
    const api = new API();

    try {
      yield put(commonActions.loadingStart());
      yield call(api.addGroupOfUser, task.user_id, task.group_id);

      const fetchJobs = [
        call(api.fetchUser, task.user_id),
        call(api.fetchGroupById, task.group_id)
      ];

      const payloads = yield all(fetchJobs);

      const putJobs = [
        put(actions.initUser(payloads[0].data.body)),
        put(actions.initGroup(payloads[1].data.body))
      ];

      yield all(putJobs);
      yield put(commonActions.triggerSnackbar("ユーザをグループに追加しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ユーザーの追加に失敗しました");
      if(!errors.unknown){
        yield put(commonActions.openException(message, JSON.stringify(errors)));
      }else{
        yield put(commonActions.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchAddGroupOfUser;
