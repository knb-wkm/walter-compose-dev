import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchToggleStar() {
  while (true) {
    const task = yield take(actions.toggleStar().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.toggleStar, task.file);

      // 一覧・簡易検索・詳細検索・ページングと再取得の条件が複雑なため表示を切り替えで対応
      if(payload.status){
        // 成功した場合、stateを更新
        yield put(actions.toggleStarSuccessful( task.file ));

        const message = yield task.file.is_star === false
          ? "お気に入りに設定しました"
          : "お気に入りを解除しました";
        yield put(commons.triggerSnackbar(message));
      }
    }
    catch (e) {
      const { message, errors } = errorParser(e,"お気に入りの設定に失敗しました");
      yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchToggleStar;
