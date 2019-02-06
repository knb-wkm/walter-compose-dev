import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchDelTag() {
  while (true) {
    const { file, tag } = yield take(actions.requestDelTag().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.fetchDelTag, file, tag);
      yield call(api.fetchFile, file._id);

      // ソート、ページネーションの状態を保持する
      const { sorted, desc } = yield select( state => state.fileSortTarget );
      const { page } = yield select( state => state.filePagination );
      const payload = yield call(api.fetchFiles, file.dir_id, page, sorted, desc);
      yield put(actions.initFiles(payload.data.body));

      // タグ編集ダイアログ用のfile objectをセット
      const changedFile = payload.data.body.filter( _file => _file._id === file._id );
      yield put(actions.initFileTag(changedFile[0]));
      yield put(commons.triggerSnackbar("タグを削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"タグの削除に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(errors));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }

  }
}

export default watchDelTag;
