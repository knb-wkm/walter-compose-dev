import React from "react";
import PropTypes from "prop-types";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

const DeleteFileDialog = ({
  open,
  file,
  actions,
  history
}) => {
  const dialogActions = [
    (
      <FlatButton
        label="削除"
        primary={true}
        onTouchTap={(e) => actions.deleteFile(
          file,
          history
        )} />
    ),
    (
      <FlatButton
        label="閉じる"
        primary={false}
        onTouchTap={actions.toggleDeleteFileDialog}
        />
    )
  ];

  return (
    <Dialog
      title={`${file.name}を削除しますか？`}
      modal={false}
      actions={dialogActions}
      open={open}
      onRequestClose={actions.toggleDeleteFileDialog}
      >
    </Dialog>
  );
};

DeleteFileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object,
  actions: PropTypes.object
};

export default DeleteFileDialog;
