import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/menus";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";


function* watchCreateRoleMenu() {
  while (true) {
    const task = yield take(actions.createRoleMenu().type);
    const api = new API();
    yield put(actions.clearRoleMenuValidationError());

    try {
      yield put(commons.loadingStart());
      yield call(api.createRoleMenu, task.roleMenu);

      const payload = yield call(api.fetchRoleMenus);
      yield put(actions.initRoleMenus(payload.data.body));

      yield task.history.push("/role_menus");
      yield put(commons.triggerSnackbar("ロールを作成しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ロールの作成に失敗しました");
      if(!errors.unknown){
        yield put(actions.saveRoleMenuValidationError(errors));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchCreateRoleMenu;
