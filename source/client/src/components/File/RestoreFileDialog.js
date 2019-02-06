import React from "react";
import PropTypes from "prop-types";

// material ui
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

const RestoreFileDialog = ({
  open,
  file,
  actions
}) => {
  const dialogActions = [
    (
      <FlatButton
        label="戻す"
        onTouchTap={() => actions.restoreFile(file)}
        primary={true} />
    ),
    (
      <FlatButton
        label="閉じる"
        onTouchTap={() => actions.toggleRestoreFileDialog() } />
    )
  ];

  return (
    <Dialog
      title="確認"
      open={open}
      modal={false}
      actions={dialogActions} >

      指定されたファイルをゴミ箱から元の場所に戻しますか？
      
    </Dialog>
  );
};

RestoreFileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object,
  actions: PropTypes.object
};

export default RestoreFileDialog;
