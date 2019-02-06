import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import errorParser from "../helper/errorParser";

function* watchFetchFile() {

  while (true) {
    const { file_id, history } = yield take(actions.requestFetchFile().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchFile, file_id);
      if (payload.data.body.is_dir) {
        throw "id is not file";
      }

      yield put(actions.initFile(payload.data.body));
    }
    catch (e) {
      const { message, errors } = errorParser(e,"ファイルの取得に失敗しました");
      if(!errors.unknown){
        yield put(commons.openException(message, errors[ Object.keys(errors)[0] ]));
      }else{
        yield put(commons.openException(message, errors.unknown ));
      }
      history.push("/home");
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }

}

export default watchFetchFile;
