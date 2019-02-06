import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import * as actionTypes from "../actionTypes";
import errorParser from "../helper/errorParser";

function* watchCreateMetaInfo() {
  while (true) {
    const { metaInfo, history } = yield take(actionTypes.CREATE_META_INFO);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.createMetaInfo, metaInfo);
      const payload = yield call(api.fetchMetaInfos);
      yield put(actions.initMetaInfos(payload.data.body));
      yield history.push("/meta_infos");
      yield put(commons.triggerSnackbar("メタ情報を作成しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"メタ情報の作成に失敗しました");
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

export default watchCreateMetaInfo;
