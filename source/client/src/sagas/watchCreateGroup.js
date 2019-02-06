import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/groups";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchCreateGroup() {
  while (true) {
    const task = yield take(actions.createGroup().type);
    const api = new API();
    yield put(actions.clearGroupValidationError());

    try {
      yield put(commons.loadingStart());
      yield call(api.createGroup, task.group);
      const payload = yield call(api.fetchGroup);
      yield put(actions.initGroups(payload.data.body));
      yield task.history.push("/groups");
      yield put(commons.triggerSnackbar("グループを作成しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"グループの作成に失敗しました");
      if(!errors.unknown){
        yield put(actions.saveGroupValidationError(errors));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchCreateGroup;
