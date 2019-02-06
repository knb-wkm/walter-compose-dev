import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";
import * as commons from "../actions/commons";
import * as filesAction from "../actions/files";
import errorParser from "../helper/errorParser";

function* watchCreateDir() {
  while (true) {
    let { dir_id, dir_name } = yield take("CREATE_DIR");
    const api = new API();
    yield put({ type: "LOADING_START" });

    try {
      if (dir_id === undefined || dir_id === null || dir_id === "") {
        dir_id = yield select( state => state.tenant.dirId );
      }

      const payload = yield call(api.createDir, dir_id, dir_name);

      // ファイル一覧の先頭に追加
      const payloadFile = yield call(api.fetchFile, payload.data.body._id);
      yield put(filesAction.insertFileRow([ payloadFile.data.body ]));

      yield put({ type: "TOGGLE_CREATE_DIR" });
      yield put({ type: "TRIGGER_SNACK", message: "フォルダを作成しました" });
    }
    catch (e) {
      const { message, errors } = errorParser(e,"フォルダの作成に失敗しました");
      if(!errors.dir_name){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ] ));
      }else{
        yield put({ type: "CREATE_DIR_ERROR", errors });
      }


    }
    finally {
      yield put({ type: "LOADING_END" });
    }

  }
}

export default watchCreateDir;
