import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";


function* watchDeleteRoleOfAction() {
  while (true) {
    const task = yield take(actions.deleteRoleOfAction().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.deleteRoleOfAction, task.role_id, task.action_id);
      const payload = yield call(api.fetchRole, task.role_id);
      yield put(actions.initRole(payload.data.body));
      yield put(commons.triggerSnackbar("ロールからアクションを削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロールからアクションの削除に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[Object.keys(errors)[0]]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDeleteRoleOfAction;
