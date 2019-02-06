import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/tags";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchSaveTagLabel() {
  while (true) {
    const task = yield take(actions.saveTagLabel().type);
    const api = new API();
    yield put(commonActions.loadingStart());

    try {
      yield call(api.saveTagLabel, task.tag);
      const payload = yield call(api.fetchTag, task.tag._id);
      yield put(actions.initTag(payload.data.body));
      yield put(commonActions.triggerSnackbar("タグ名を保存しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"タグ名の保存に失敗しました");
      if(errors.label !== undefined){
        yield put(actions.saveTagValidationError(errors));
      }else{
        yield put(commonActions.openException(message, errors[ Object.keys(errors)[0] ]));
      }
    } finally {
      yield put(commonActions.loadingEnd());

    }
  }
}

export default watchSaveTagLabel;
