import React from "react";
import PropTypes from "prop-types";

// material ui
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

const DeleteDirDialog = ({
  dir,
  open,
  actions
}) => {
  const dialogActions = [
    (
      <FlatButton
        label="削除"
        primary={true}
        onTouchTap={() => actions.deleteDir(dir)}
        />
    ),
    (
      <FlatButton
        label="閉じる"
        primary={false}
        onTouchTap={actions.toggleDeleteDirDialog}
        />
    )
  ];

  return (
    <Dialog
      title={`${dir.name}を削除しますか？`}
      modal={false}
      actions={dialogActions}
      open={open}
      onRequestClose={actions.toggleDeleteDirDialog}
      >
    </Dialog>
  );
};

DeleteDirDialog.propTypes = {
  dir: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  actions: PropTypes.object
};

export default DeleteDirDialog;
