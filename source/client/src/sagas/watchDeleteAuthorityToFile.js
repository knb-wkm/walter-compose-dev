import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchDeleteAuthorityToFile() {
  while (true) {
    const { file, user, role } = yield take(
      actions.deleteAuthorityToFile().type
    );

    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.deleteAuthorityToFile, file, user, role);
      const payload = yield call(api.fetchFile, file._id);
      yield put(actions.initFile(payload.data.body));
      yield put(commons.triggerSnackbar("権限を削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"権限の削除に失敗しました");
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

export default watchDeleteAuthorityToFile;
