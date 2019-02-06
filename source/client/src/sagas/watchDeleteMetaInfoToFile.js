import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import * as actionTypes from "../actionTypes";
import errorParser from "../helper/errorParser";

function* watchDeleteMetaInfoToFile() {
  while (true) {
    const { file, metaInfo } = yield take(actionTypes.DELETE_META_INFO_TO_FILE);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.deleteMetaInfoToFile, file, metaInfo);
      const payload = yield call(api.fetchFile, file._id);
      yield put(actions.updateFileRow(payload.data.body));
      yield put(commons.triggerSnackbar("メタ情報を削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"メタ情報の削除に失敗しました");
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

export default watchDeleteMetaInfoToFile;
