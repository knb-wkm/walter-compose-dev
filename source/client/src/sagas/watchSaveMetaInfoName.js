import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/index";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveMetaInfoName() {
  while (true) {
    const { changedMetaInfo } = yield take(actions.saveMetaInfoName().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.saveMetainfoName, changedMetaInfo);

      yield put(actions.clearMetaInfoValidationErrors());
      yield put(commons.triggerSnackbar("メタ情報名を変更しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"メタ情報名の変更に失敗しました");
      if(!errors.unknown){
        yield put(actions.saveMetaInfoValidationErrors(errors));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchSaveMetaInfoName;
