import React from "react";
import PropTypes from "prop-types";

import RaisedButton from 'material-ui/RaisedButton';

const AddDownloadBtn =({
  actions,
  match,
  isSimple,
  disableDownloadBtnSimple,
  disableDownloadBtnDetail
}) => {
  const dir_id = match.params.id;

  if( isSimple === false){
    return (
      <div>
        <RaisedButton
          disabled={disableDownloadBtnDetail}
          label="一覧ダウンロード"
          onClick={() => {
            actions.downloadXlsxFileDetail();
          }} />
      </div>
    );

  }else if (match.path === "/files/search") {
    return (
      <div>
        <RaisedButton
          disabled={disableDownloadBtnSimple}
          label="一覧ダウンロード"
          onClick={() => {
            actions.downloadXlsxFileSimple();
          }} />
      </div>
    );

  }else{
    return (
      <div>
        <RaisedButton
          label="一覧ダウンロード"
          onClick={() => {
            actions.downloadXlsxFile(dir_id);
          }} />
      </div>
    );
  }

};

AddDownloadBtn.propTypes = {
  actions: PropTypes.object
};

export default AddDownloadBtn;