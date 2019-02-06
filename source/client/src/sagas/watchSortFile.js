import { call, put, take, select } from "redux-saga/effects";

import * as actions from "../actions/files";
import * as actionTypes from "../actionTypes";
import * as commons from "../actions/commons";
import { API } from "../apis";
import errorParser from "../helper/errorParser";

function* watchSortFile() {
  while (true) {
    const { dir_id, page } = yield take(actionTypes.SORT_FILE);
    const api = new API();

    yield put(commons.loadingStart());

    try {
      const fileSortTarget = yield select( state => state.fileSortTarget );
      const payload = yield call(
        api.fetchFiles,
        dir_id,
        page,
        fileSortTarget.sorted,
        fileSortTarget.desc
      );

      yield put(actions.initFileTotal(payload.data.status.total));
      yield put(actions.initFiles(payload.data.body));
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

export default watchSortFile;
