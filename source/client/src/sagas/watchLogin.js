import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// action
import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchLogin() {
  while (true) {
    const { account_name, password } = yield take(actionTypes.REQUEST_LOGIN);
    const api = new API();
    yield put(actions.loadingStart());

    try {
      const tenant_name = localStorage.getItem("tenant_name");
      const payload = yield call(api.login, account_name, password, tenant_name);
      const { user, token } = payload.data.body;
      localStorage.setItem("token", token);
      const { _id, name, home_dir_id, trash_dir_id, trash_icon_visibility } = user.tenant;
      yield put(actions.putTenant(_id, name, home_dir_id, trash_dir_id, trash_icon_visibility));
      yield put(actions.requestLoginSuccess("success", user._id));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ログインに失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(actions.loadingEnd());
    }
  }
}

export default watchLogin;
