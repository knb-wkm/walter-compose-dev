import { call, take, select, put } from "redux-saga/effects";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";

import { API } from "../apis";
import { LIST_SEARCH_DETAIL } from "../constants/index";

import { isDisplayUnvisibleSetting } from "./watchToggleDisplayUnvisibleFiles";

import { isMatch } from "lodash";
import errorParser from "../helper/errorParser";

function* watchSearchFileDetail() {
  while (true) {
    try {

      const { list_type } = yield select(state => state.fileListType);
      if(list_type !== LIST_SEARCH_DETAIL ) yield put(actions.setFileListType(LIST_SEARCH_DETAIL));

      const { searchedItems:old_items } = yield select( state => state.fileDetailSearch );
      const { items } = yield take(actions.searchFileDetail().type);

      if( !isMatch(old_items,items) ){
        yield put(actions.initFilePagination());
        yield put(actions.clearFiles());
      }

      yield put(commons.loadingStart());
      const api = new API();
      const { page } = list_type !== LIST_SEARCH_DETAIL ? { page : 0 } : yield select( state => state.filePagination );
      const { sorted, desc } = yield select( state => state.fileSortTarget );

      // 非表示ファイルを取得するか
      const isDisplayUnvisible = yield call(isDisplayUnvisibleSetting);
      const payload = yield call(api.searchFilesDetail, items, page, sorted, desc, isDisplayUnvisible);

      if (page === 0 || page === null) {
        yield put(actions.initFilePagination());
        yield put(actions.initFileTotal(payload.data.status.total));
        yield put(actions.initFiles(payload.data.body));
      }
      else {
        yield put(actions.initNextFiles(payload.data.body));
      }

    }
    catch (e) {
      const { message, errors } = errorParser(e,"一覧の取得に失敗しました");
      yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchSearchFileDetail;
