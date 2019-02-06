import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/users";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchCreateUser() {
  while (true) {
    const task = yield take(actions.createUser().type);
    const api = new API();

    try {
      yield put(commonActions.loadingStart());
      yield call(api.createUser, task.user);
      const payload = yield call(api.fetchUsers, localStorage.getItem("tenantId"));
      yield put(actions.initUsers(payload.data.body));
      yield task.history.push("/users");
      yield put(commonActions.triggerSnackbar("ユーザを作成しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e, "ユーザの作成に失敗しました");
      if(!errors.unknown){
        yield put(actions.changeUserValidationError(errors));
      }else{
        yield put(commonActions.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchCreateUser;
