import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchSearchFileDetail() {
  while (true) {
    const { page, sorted, desc } = yield take(actions.fetchSearchFileDetail().type);
    const api = new API();

    yield put(commons.loadingStart());

    try {
      const { searchedItems } = yield select( state => state.fileDetailSearch );
      const payload = yield call(api.searchFilesDetail, searchedItems, page, sorted, desc);

      if (page === 0 || page === null) {
        const { total } = payload.data.status;
        yield put(actions.initFileTotal(total));
        yield put(actions.initFiles(payload.data.body));
      }
      else {
        yield put(actions.initNextFiles(payload.data.body));
      }
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ファイル一覧の取得に失敗しました");
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

export default watchFetchSearchFileDetail;
