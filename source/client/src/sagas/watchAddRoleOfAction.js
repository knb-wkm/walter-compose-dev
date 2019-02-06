import { call, put, take }  from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchAddRoleOfAction() {
  while (true) {
    const task = yield take(actions.addRoleOfAction().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.addRoleOfAction, task.role_id, task.action_id);
      const payload = yield call(api.fetchRole, task.role_id);
      yield put(actions.initRole(payload.data.body));
      yield put(commons.triggerSnackbar("ロールにアクションを追加しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"アクションの追加に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, JSON.stringify(errors)));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally{
      yield put(commons.loadingEnd());
    }
  }
}

export default watchAddRoleOfAction;
