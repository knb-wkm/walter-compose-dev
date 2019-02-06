import { call, put, take, all, select } from "redux-saga/effects";

// api
import { API } from "../apis";

import { isDisplayUnvisibleSetting } from "./watchToggleDisplayUnvisibleFiles";

// actions
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

export function* watchFetchFiles() {
  while (true) {
    let { dir_id, page, sorted, desc } = yield take( actions.requestFetchFiles().type );

    yield put(commons.loadingStart());
    const api = new API();

    try {
      // 非表示ファイルを取得するか
      const isDisplayUnvisible = yield call(isDisplayUnvisibleSetting);
      if (page === 0 || page === null) {

        let files, dirs;

        const { sorted, desc } = yield select( state => state.fileSortTarget );

        if (sorted === null) {
          let defaultSort = yield call(api.fetchDisplayItems);
          defaultSort = defaultSort.data.body.filter( item => item.default_sort );
          defaultSort = defaultSort.length > 0 ? defaultSort[0] : null;
          const _defaultSort = defaultSort.meta_info_id === null
                ? defaultSort.name
                : defaultSort.meta_info_id;

          [ files, dirs ] = yield all([
            call(api.fetchFiles, dir_id, page, _defaultSort, defaultSort.default_sort.desc, isDisplayUnvisible),
            call(api.fetchDirs, dir_id),
            put(actions.setSortTarget(_defaultSort))
          ]);
        }
        else {
          [ files, dirs ] = yield all([
            call(api.fetchFiles, dir_id, page, sorted, desc, isDisplayUnvisible),
            call(api.fetchDirs, dir_id)
          ]);
        }

        yield put(actions.initFileTotal(files.data.status.total));
        yield put(actions.initFiles(files.data.body));
        yield put(actions.initDir(dirs.data.body));

      }
      else {
        const files = yield call(api.fetchFiles, dir_id, page, sorted, desc, isDisplayUnvisible);
        yield put(actions.initNextFiles(files.data.body));
      }
    }
    catch (e) {
      const { message, errors } = errorParser(e,"一覧の取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }

  }
}

