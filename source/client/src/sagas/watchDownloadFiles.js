import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";

import { saveAs } from "file-saver";

import { createFileName } from "../helper/fileNameParser";

function* watchDownloadFiles() {
  while (true) {
    const { files } = yield take(actions.downloadFiles().type);
    const api = new API();

    try {
      yield put(commons.loadingStart());

      const format = (yield call(api.downloadInfoFile)).data.body;

      for(let i=0;i<files.length;i++){
        const file = files[i];
        const file_name = createFileName(file, format);

        const payload = yield call(api.downloadFile, file);

        const download = new Blob(
          [ payload.data ], { type: file.mime_type });

        yield saveAs(download, file_name);
      }
      yield put(actions.toggleDownloadFilesDialog());
    }
    catch (e) {
      yield put(commons.openException("ファイルのダウンロードに失敗しました" ));
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDownloadFiles;
