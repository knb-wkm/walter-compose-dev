import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchDeleteDir() {
  while (true) {
    const { dir } = yield take(actions.deleteDir().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const tenant = yield select( state => state.tenant );
      let message;

      if ( dir.dir_id === tenant.trashDirId ) {
        yield call(api.deleteFile, dir);
        message = "フォルダをごみ箱から削除しました";
      }
      else {
        yield call(api.moveFileTrash, dir);
        message = "フォルダをごみ箱へ移動しました";
      }

      const payload = yield call(api.fetchFiles, dir.dir_id, 0);
      yield put(actions.initFiles(payload.data.body));
      yield put(actions.initFileTotal(payload.data.status.total));
      yield put(actions.toggleDeleteDirDialog());
      yield put(commons.triggerSnackbar(message));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"フォルダの削除に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, JSON.stringify(errors)));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDeleteDir;
