import React from "react";
import PropTypes from "prop-types";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

// components
import DirTreeContainer from "../../containers/DirTreeContainer";

const CopyFileDialog = ({
  open,
  file,
  dir_id,
  actions
}) => {
  const dialogActions = [
    (
      <FlatButton
        label="コピー"
        onTouchTap={() => actions.copyFile(dir_id, file)}
        primary={true}
        />
    ),
    (
      <FlatButton
        label="閉じる"
        onTouchTap={() => actions.toggleCopyFileDialog() }
        />
    )
  ];

  return (
    <Dialog
      title="ファイルをコピー"
      open={open}
      modal={false}
      autoScrollBodyContent
      actions={dialogActions} >

      <DirTreeContainer />

    </Dialog>
  );
};

CopyFileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object,
  dir_id: PropTypes.number,
  actions: PropTypes.object
};

export default CopyFileDialog;
