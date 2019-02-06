import React from "react";
import PropTypes from "prop-types";

// material-ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

const DownloadFilesDialog = ({
  open,
  handleClose,
  downloadFiles,
  files
}) => {
  const actions = [
    (
      <FlatButton
        label="ダウンロード"
        primary={true}
        onTouchTap={(e) => downloadFiles(files)}
        />
    ),
    (
      <FlatButton
        label="閉じる"
        primary={false}
        onTouchTap={handleClose}
        />
    )
  ];

  return (
    <Dialog
      title={`選択された${files.length}個のアイテムをダウンロードしますか？`}
      modal={false}
      actions={actions}
      open={open}
      onRequestClose={handleClose}
      >
    </Dialog>
  );

};

DownloadFilesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  downloadFiles: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired
};

export default DownloadFilesDialog;

