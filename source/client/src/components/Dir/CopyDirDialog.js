import React from "react";
import PropTypes from "prop-types";

// material ui
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

// components
import DirTreeContainer from "../../containers/DirTreeContainer";

const CopyDirDialog = ({
  open,
  actions
}) => {
  const dialogActions = [
    (
      <FlatButton
        label="コピー"
        primary={true}
        />
    ),
    (
      <FlatButton
        label="閉じる"
        onTouchTap={actions.toggleCopyDirDialog}
        />
    )
  ];

  return (
    <Dialog
      title="フォルダをコピー"
      open={open}
      modal={false}
      autoScrollBodyContent
      actions={dialogActions} >

      <DirTreeContainer />

    </Dialog>
  );
};

CopyDirDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};

export default CopyDirDialog;
