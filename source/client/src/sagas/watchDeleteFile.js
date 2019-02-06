import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";
import { LIST_DEFAULT, LIST_SEARCH_SIMPLE, LIST_SEARCH_DETAIL } from "../constants";

function* watchDeleteFile() {
  while (true) {
    const { file, history } = yield take(actions.deleteFile().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const tenant = yield select(state => state.tenant);

      let message;

      if (file.dir_id === tenant.trashDirId) {
        yield call(api.deleteFile, file);
        message = `${file.name} をごみ箱から削除しました`;
      }
      else {
        yield call(api.moveFileTrash, file);
        message = `${file.name} をごみ箱へ移動しました`;
      }

      const { list_type } = yield select( state => state.fileListType);
      const { sorted, desc } = yield select( state => state.fileSortTarget );
      let payload;
      switch (list_type) {
        case LIST_SEARCH_DETAIL:
          yield history.push(`/files/search`);
          const { searchedItems } = yield select( state => state.fileDetailSearch );
          payload = yield call(api.searchFilesDetail, searchedItems, 0, sorted, desc);
        break;

        case LIST_SEARCH_SIMPLE:
          yield history.push(`/files/search`);
          const { value } = yield select( state => state.fileSimpleSearch.search_value );
          payload = yield call(api.searchFiles, value, 0, sorted, desc);
        break;

        case LIST_DEFAULT:
          yield history.push(`/home/${file.dir_id}`);
          payload = yield call(api.fetchFiles, file.dir_id , 0 , sorted, desc );
        break;

        default:
          yield history.push(`/home/${file.dir_id}`);
          payload = yield call(api.fetchFiles, file.dir_id , 0 , sorted, desc );
          break;
      }

      yield put(actions.initFileTotal(payload.data.status.total));
      yield put(actions.initFiles(payload.data.body));
      yield put(actions.toggleDeleteFileDialog(file));
      yield put(commons.triggerSnackbar(message));

    }
    catch (e) {
      const { message, errors } = errorParser(e,"ファイルの削除に失敗しました");
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

export default watchDeleteFile;
