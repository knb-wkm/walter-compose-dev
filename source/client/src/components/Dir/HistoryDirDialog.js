import React from "react";
import PropTypes from "prop-types";

// material ui
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

// components
import History from "../History";

const HistoryDirDialog = ({
  open,
  handleClose,
  dir
}) => {
  const actions = (
    <FlatButton
      label="閉じる"
      primary={false}
      onTouchTap={handleClose}
      />
  );

  const renderHistory = (idx, history) => {
    return (
      <History key={idx} history={history} />
    );
  };

  return (
    <Dialog
      title="履歴"
      open={open}
      modal={false}
      actions={actions} >

      {dir !== undefined
        ? dir.histories.map( (history, idx) => renderHistory(idx, history))
        : null
      }

    </Dialog>
  );
};

HistoryDirDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  dir: PropTypes.object
};

export default HistoryDirDialog;
