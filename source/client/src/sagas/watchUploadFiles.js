import { call, put, take, all } from "redux-saga/effects";
import MD5 from "crypto-js/md5";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

import { API } from "../apis";

function* watchUploadFiles() {
  while (true) {
    const { dir_id, files, disableFileBuffer } = yield take(actions.uploadFiles().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      // const uploadPayload = yield call(api.filesUpload, dir_id, files);

      // fileのパース yieldでコールするのでpromiseでラップしておく
      const readFile = file => {
        return new Promise( (resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = e => {
            resolve({
              name: file.name,
              size: file.size,
              mime_type: file.type,
              modified: file.lastModified,
              base64: reader.result,
              checksum: MD5(reader.result).toString()
            });
          };
        });
      };

      const _files = yield all(files.map( f => readFile(f) ));
      const uploadPayload = yield call(api.filesUploadBlob, dir_id, _files);

      if (!disableFileBuffer) {
        // アップロードダイアログの一覧を更新
        const buffers = uploadPayload.data.body.map( body => (
          put(actions.pushFileToBuffer(body))
        ));

        yield all(buffers);
      }

      // ファイル一覧の先頭に追加
      yield put(actions.insertFileRow(uploadPayload.data.body));

      const toggleCheckTasks = uploadPayload.data.body.map( file => put(actions.toggleFileCheck(file)) );

      yield all(toggleCheckTasks);
      yield put(commons.triggerSnackbar("ファイルをアップロードしました"));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"タグ名の保存に失敗しました");
      yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
    }
    finally {
      yield put(commons.loadingEnd());
    }

  }
}

export default watchUploadFiles;
