import React from "react";
import PropTypes from "prop-types";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

// components
import DirTreeContainer from "../../containers/DirTreeContainer";

const MoveFileDialog = ({
  open,
  file,
  dir,
  actions,
  files
}) => {

  const dialogActions = [
    (
      <FlatButton
        label="移動"
        onTouchTap={() => {
          if(file === undefined ){
            const target = files.filter(file => file.checked);
            actions.moveFiles(dir, target);
          }else{
            actions.moveFile(dir, file);
          }
        }}
        primary={true}
        />
    ),
    (
      <FlatButton
        label="閉じる"
        onTouchTap={() => actions.toggleMoveFileDialog()}
        />
    )
  ];

  return (
    <Dialog
      title="ファイルを移動"
      open={open}
      modal={false}
      autoScrollBodyContent
      actions={dialogActions} >

      <DirTreeContainer />

    </Dialog>
  );
};

MoveFileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object,
  dir: PropTypes.object,
  actions: PropTypes.object
};

export default MoveFileDialog;
