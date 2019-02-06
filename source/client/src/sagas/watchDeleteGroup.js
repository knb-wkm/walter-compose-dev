import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/groups";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchDeleteGroup() {
  while (true) {
    const task = yield take(actions.deleteGroup().type);
    const api = new API();

    try {
      yield put(commons.loadingStart());
      yield call(api.deleteGroup, task.group_id);
      const payload = yield call(api.fetchGroup);
      yield put(actions.initGroups(payload.data.body));
      yield task.history.push("/groups");
      yield put(commons.triggerSnackbar("グループを削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"グループの削除に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, JSON.stringify(errors)));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDeleteGroup;
