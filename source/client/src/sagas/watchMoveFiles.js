import { call, put, take, all, select } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import { LIST_DEFAULT, LIST_SEARCH_SIMPLE, LIST_SEARCH_DETAIL } from "../constants";
import errorParser from "../helper/errorParser";

function* watchMoveFiles() {
  while (true) {
    const task = yield take(actions.moveFiles().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const { dir, files } = task;
      const jobs = files.map( file => call(api.moveFile, dir, file) );
      yield all(jobs);


      const { list_type } = yield select( state => state.fileListType);
      const { sorted, desc } = yield select( state => state.fileSortTarget );

      let payload;
      switch (list_type) {
        case LIST_SEARCH_DETAIL:
          const { searchedItems } = yield select( state => state.fileDetailSearch );
          payload = yield call(api.searchFilesDetail, searchedItems, 0, sorted, desc);
        break;

        case LIST_SEARCH_SIMPLE:
          const { value } = yield select( state => state.fileSimpleSearch.search_value );
          payload = yield call(api.searchFiles, value, 0, sorted, desc);
        break;

        case LIST_DEFAULT:
        default:
          payload = yield call(api.fetchFiles, files[0].dir_id, 0, sorted, desc);
          break;
      }

      yield put(actions.initFiles(payload.data.body));
      yield put(actions.initFileTotal(payload.data.status.total));

      const dialogOpen = yield select( state => state.moveFile.open );
      if (dialogOpen === true) {
        yield put(actions.toggleMoveFileDialog());
      }

      yield put(commons.triggerSnackbar(`選択された${files.length}個のファイルを${dir.name}に移動しました`));

    }
    catch (e) {
      const { message, errors } = errorParser(e,"ファイルの移動に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchMoveFiles;
