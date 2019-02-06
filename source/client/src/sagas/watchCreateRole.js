import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/roles";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchCreateRole() {
  while (true) {
    const task = yield take(actions.createRole().type);
    const api = new API();
    yield put(actions.clearRoleValidationError());

    try {
      yield put(commons.loadingStart());
      yield call(api.createRole, task.role);
      const payload = yield call(api.fetchRoles);
      yield put(actions.initRoles(payload.data.body));
      yield task.history.push("/role_files");
      yield put(commons.triggerSnackbar("ロールを作成しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロールの作成に失敗しました");
      if(!errors.unknown){
        yield put(actions.saveRoleValidationError(errors));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchCreateRole;
