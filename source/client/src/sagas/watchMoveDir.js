import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import errorParser from "../helper/errorParser";
import * as commons from "../actions/commons";

function* watchMoveDir() {
  while (true) {
    const { destinationDir, movingDir } = yield take("MOVE_DIR");
    const api = new API();
    yield put({ type: "LOADING_START" });

    try {
      yield call(api.moveDir, destinationDir, movingDir);
      const payload = yield call(api.fetchFiles, movingDir.dir_id);
      yield put({ type: "INIT_FILES", files: payload.data.body });
      yield put({ type: "TRIGGER_SNACK", message: "フォルダを移動しました" });
      yield put({ type: "TOGGLE_MOVE_DIR_DIALOG" });
    }
    catch (e) {
      const { message, errors } = errorParser(e,"フォルダの移動に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put({ type: "LOADING_END" });
    }

  }
}

export default watchMoveDir;
