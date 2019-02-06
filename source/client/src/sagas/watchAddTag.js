import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchAddTag() {
  while (true) {
    const { file, tag } = yield take(actions.requestAddTag().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.fetchAddTag, file, tag);

      const payload = yield call(api.fetchFile, file._id);
      yield put(actions.updateFileRow(payload.data.body));

      // タグ編集ダイアログ用のfile objectをセット
      yield put(actions.initFileTag(payload.data.body));
      yield put(commons.triggerSnackbar("タグを追加しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"アクションの追加に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors.menu));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }

  }
}

export default watchAddTag;
