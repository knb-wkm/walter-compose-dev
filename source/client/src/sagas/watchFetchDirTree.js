import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";
import { verify } from "./watchRequestVerifyToken";

function* watchFetchDirTree() {
  while (true) {
    let { root_id } = yield take("REQUEST_FETCH_DIR_TREE");
    const api = new API();
    yield put({ type: "LOADING_FETCH_DIR_TREE" });
    yield put({ type: "LOADING_START" });

    try {

      if(root_id === undefined || root_id === null || root_id === ""){
        // root_idが無い場合は再認証する
        const token = localStorage.getItem("token");
        yield call( verify ,token );
        root_id = yield select( state => state.tenant.dirId );
      }

      const payload = yield call(api.fetchDirTree, root_id);
      yield put({ type: "PUT_DIR_TREE", node: payload.data.body });
    }
    catch (e) {
      const { message, errors } = errorParser(e,"フォルダ一覧の取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put({ type: "LOADING_END" });
    }

  }
}

export default watchFetchDirTree;
