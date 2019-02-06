import { put, take } from "redux-saga/effects";

// import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import * as actionTypes from "../actionTypes";
import errorParser from "../helper/errorParser";

function* watchCopyFile() {
  while (true) {
    // const { dir_id, file } = yield take(actionTypes.COPY_FILE);
    yield take(actionTypes.COPY_FILE);
    yield put(commons.loadingStart());

    try {
      yield put(actions.toggleCopyFileDialog());
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ファイルのコピーに失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors.menu));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchCopyFile;
