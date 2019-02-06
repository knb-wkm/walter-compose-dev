import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/tags";
import * as commonActions from "../actions/commons";

import errorParser from "../helper/errorParser";

function* watchCreateTag() {
  while (true) {
    const task = yield take(actions.createTag().type);
    const api = new API();
    yield put(commonActions.loadingStart());

    try {
      yield call(api.createTag, task.tag);
      const payload = yield call(api.fetchTags);
      yield put(actions.initTags(payload.data.body));
      yield put(actions.initTag());
      yield task.history.push("/tags");
      yield put(commonActions.triggerSnackbar("タグを作成しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"タグの作成に失敗しました");
      if(!errors.unknown){
        yield put(actions.saveTagValidationError(errors));
      }else{
        yield put(commonActions.openException(message, errors.unknown ));
      }
    } finally {
      yield put(commonActions.loadingEnd());
    }
  }
}

export default watchCreateTag;
