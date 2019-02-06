import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import { LIST_DEFAULT, LIST_SEARCH_SIMPLE, LIST_SEARCH_DETAIL } from "../constants";
import errorParser from "../helper/errorParser";

function* watchMoveFile() {
  while (true) {
    const task = yield take(actions.moveFile().type);
    const api = new API();
    const { dir, file } = task;
    yield put(commons.loadingStart());

    try {
      yield call(api.moveFile, dir, file);

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
          payload = yield call(api.fetchFiles, file.dir_id , 0 , sorted, desc );
          break;
      }

      yield put(actions.initFiles(payload.data.body));
      yield put(actions.initFileTotal(payload.data.status.total));

      // DnDから呼ばれる場合もあるので
      const dialogOpen = yield select( state => state.moveFile.open );

      if (dialogOpen === true) {
        yield put(actions.toggleMoveFileDialog());
      }

      yield put(commons.triggerSnackbar(`${file.name}を${dir.name}に移動しました`));
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

export default watchMoveFile;
