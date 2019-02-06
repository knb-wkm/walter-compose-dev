import React from "react";
import PropTypes from "prop-types";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

// components
import MetaInfo from "../MetaInfo";

const MetaInfoDialog = ({
  open,
  file,
  metaInfo,
  actions
}) => {
  const dialogActions = (
    <FlatButton
      label="閉じる"
      primary={true}
      onTouchTap={() => actions.toggleFileMetaInfoDialog() }
      />
  );
  return (
    <Dialog
      title="メタ情報を編集"
      actions={dialogActions}
      modal={false}
      open={open}
      autoScrollBodyContent={true}
      onRequestClose={() => actions.toggleFileMetaInfoDialog() } >

      <MetaInfo
        file={file}
        metaInfo={metaInfo}
        addMetaInfoToFile={actions.addMetaInfoToFile}
        deleteMetaInfoToFile={actions.deleteMetaInfoToFile} />

    </Dialog>
  );
};

MetaInfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object.isRequired,
  metaInfo: PropTypes.array.isRequired,
  actions: PropTypes.object
};

export default MetaInfoDialog;
