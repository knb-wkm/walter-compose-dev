import { put, take, call } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchChangeFileName() {
  while(true) {
    const { file, name } = yield take(actions.changeFileName().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.changeFileName, file, name);
      const payload = yield call(api.fetchFile, file._id);
      yield put(actions.initFile(payload.data.body));
      yield put(commons.triggerSnackbar("ファイル名を変更しました"));
      yield put(actions.toggleChangeFileNameDialog(file));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ファイル名の変更に失敗しました");
      if(!errors.unknown){
        yield put(actions.changeFileNameError(errors));
        yield put(commons.openException(message));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchChangeFileName;
