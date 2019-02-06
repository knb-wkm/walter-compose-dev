import { call, put, take, all, select } from "redux-saga/effects";
import * as _ from "lodash";

import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";
import { LIST_DEFAULT, LIST_SEARCH_SIMPLE, LIST_SEARCH_DETAIL } from "../constants";

export function* isDisplayUnvisibleSetting() {
  const api = new API();

  // 非表示ファイルを取得するか
  const isDisplayUnvisibleSetting = yield select( state => {
    return _.find(state.appSettings, s => s.name === "unvisible_files_toggle" );
  });

  let isDisplayUnvisible;

  if (isDisplayUnvisibleSetting) {
    isDisplayUnvisible = isDisplayUnvisibleSetting.value;
  } else {
    const settingsPayload = yield call(api.fetchAppSettings);
    const settings = settingsPayload.data.body;
    isDisplayUnvisible = _.find(settings, s => s.name === "unvisible_files_toggle" ).default_value;
  }

  return isDisplayUnvisible;
}

export function* watchToggleDisplayUnvisibleFiles() {
  while(true) {
    const task = yield take( actions.toggleDisplayUnvisibleFiles().type );
    yield put(actions.toggleDisplayUnvisibleFiles(task.checked));
    yield put(commons.loadingStart());

    const dir = _.last(yield select( state => state.dirs ));

    const dir_id = dir === undefined
          ? (yield select( state => state.tenant )).dirId
          : dir._id;

    const api = new API();

    // 非表示ファイルを取得するか
    const isDisplayUnvisible = yield call(isDisplayUnvisibleSetting);

    try {
      const { list_type } = yield select( state => state.fileListType);
      const { sorted, desc } = yield select(state => state.fileSortTarget);

      let payload;

      switch (list_type) {
      case LIST_SEARCH_DETAIL:
        const { searchedItems } = yield select( state => state.fileDetailSearch );
        payload = yield call(api.searchFilesDetail, searchedItems, 0, sorted, desc, isDisplayUnvisible);
        break;
      case LIST_SEARCH_SIMPLE:
        const { value } = yield select( state => state.fileSimpleSearch.search_value );
        payload = yield call(api.searchFiles, value, 0, sorted, desc, isDisplayUnvisible);
        break;
      case LIST_DEFAULT:
        payload = yield call(api.fetchFiles, dir_id, 0, sorted, desc, isDisplayUnvisible);
        break;
      }
      // ページネーションしている場合、Yoffsetを記憶しているので強制的にスクロールトップする
      yield put(actions.initFilePagination());
      yield put(actions.initFiles(payload.data.body));
      yield put(actions.initFileTotal(payload.data.status.total));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"一覧の取得に失敗しました");
      if (!errors.unknown) {
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      } else {
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

