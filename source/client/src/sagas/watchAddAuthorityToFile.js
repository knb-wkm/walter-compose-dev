import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchAddAuthorityToFile() {
  while (true) {
    const { file, user, role } = yield take(
      actions.addAuthorityToFile().type
    );

    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.addAuthorityToFile, file, user, role);
      const payload = yield call(api.fetchFile, file._id);
      yield put(actions.initFile(payload.data.body));
      yield put(commons.triggerSnackbar("権限を追加しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"権限の追加に失敗しました");
      if(!errors.unknown){
        if (errors.role_set !== undefined) {
          const detail = errors.role_set;
          yield put(commons.openException(message, detail));
        } else {
          yield put(commons.openException(message));
        }
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }

    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchAddAuthorityToFile;
