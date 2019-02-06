import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/tags";
import * as commonActions from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchDeleteTag() {
  while (true) {
    const task = yield take(actions.deleteTag().type);
    const api = new API();
    yield put(commonActions.loadingStart());

    try {
      yield call(api.deleteTag, task.tag_id);
      const payload = yield call(api.fetchTags);
      yield put(actions.initTags(payload.data.body));
      yield put(commonActions.loadingEnd());
      yield task.history.push("/tags");
      yield put(actions.initTag());
      yield put(commonActions.triggerSnackbar("タグを削除しました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"タグの削除に失敗しました");
      if(!errors.unknown){
        yield put(commonActions.openException(message, errors[Object.keys(errors)[0]]));
      }else{
        yield put(commonActions.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commonActions.loadingEnd());
    }

  }
}

export default watchDeleteTag;
