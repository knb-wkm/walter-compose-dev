import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchRestoreFile() {
  while (true) {
    const { file } = yield take(actions.restoreFile().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.restoreFile, file);
      const payload = yield call(api.fetchFiles, file.dir_id);
      yield put(actions.initFiles(payload.data.body));
      yield put(actions.initFileTotal(payload.data.status.total));
      yield put(actions.toggleRestoreFileDialog());
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ファイルの復元に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }finally{
      yield put(commons.loadingEnd());
    }
  }
}

export default watchRestoreFile;
