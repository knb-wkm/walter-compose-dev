import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";

import { isDisplayUnvisibleSetting } from "./watchToggleDisplayUnvisibleFiles";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";

import { saveAs } from "file-saver";

function* watchDownloadXlsxFile() {
  while (true) {
    const { dir_id } = yield take(actions.downloadXlsxFile().type);
    const api = new API();

    // 非表示ファイルを取得するか
    const isDisplayUnvisible = yield call(isDisplayUnvisibleSetting);

    try {
      const { page } = yield select( state => state.filePagination );
      const { sorted, desc } = yield select( state => state.fileSortTarget );

      yield put(commons.loadingStart());
      const payload = yield call(api.downloadXlsxFile, dir_id, page, sorted, desc, isDisplayUnvisible);

      const download = new Blob(
        [ payload.data ]
        );

        yield saveAs(download, "list.xlsx");
      }
    catch (e) {
      yield put(commons.openException("ファイルのダウンロードに失敗しました" ));
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDownloadXlsxFile;
