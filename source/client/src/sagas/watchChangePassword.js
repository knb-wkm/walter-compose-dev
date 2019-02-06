import { call, put, take, select } from "redux-saga/effects";

import * as commons from "../actions/commons";

// api
import { API } from "../apis";
import errorParser from "../helper/errorParser";

function* watchChangePassword() {

  while (true) {
    const { current_password, new_password } = yield take("REQUEST_CHANGE_PASSWORD");
    const api = new API();

    try {
      yield put({ type: "LOADING_START" });
      const user_id = yield select( state => state.session.user_id );
      yield call(api.changePassword, user_id, current_password, new_password);
      yield put({ type: "CHANGE_PASSWORD_SUCCESS" });
      yield put({ type: "TRIGGER_SNACK", message: "パスワードを変更しました" });
    }
    catch (e) {
      const { message, errors } = errorParser(e,"パスワードの変更に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message));
        yield put({ type: "CHANGE_PASSWORD_FAILED", errors });
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put({ type: "LOADING_END" });
    }
  }

}

export default watchChangePassword;
