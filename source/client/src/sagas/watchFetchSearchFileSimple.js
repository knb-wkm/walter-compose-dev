import { put, take, call, select } from "redux-saga/effects";

import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import * as actionTypes from "../actionTypes";
import { LIST_SEARCH_SIMPLE } from "../constants/index";
import errorParser from "../helper/errorParser";

function* watchFetchSearchFileSimple() {
  while (true) {
    const { page, sorted, desc } = yield take(actionTypes.FETCH_SEARCH_FILE_SIMPLE);
    const api = new API();
    try {
      yield put(commons.loadingStart());
      const { value } = yield select( state => state.fileSimpleSearch.search_value );


      const { list_type } = yield select(state => state.fileListType);
      if(list_type !== LIST_SEARCH_SIMPLE ){
        yield put(actions.initFilePagination());
        yield put(actions.clearFiles());
        yield put(actions.setFileListType(LIST_SEARCH_SIMPLE));
      }

      const payload = yield call(api.searchFiles, value, page, sorted, desc);
      yield put(actions.keepFileSimpleSearchValue({value, page, sorted, desc}));

      if (page === 0 || page === null ) {
        yield put(actions.initFileTotal(payload.data.status.total));
        yield put(actions.initFiles(payload.data.body));
      }
      else {
        yield put(actions.initNextFiles(payload.data.body));
      }

    }
    catch(e) {
      const { message, errors } = errorParser(e,"ファイル一覧の取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
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

export default watchFetchSearchFileSimple;
