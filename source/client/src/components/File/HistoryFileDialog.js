import React from "react";
import PropTypes from "prop-types";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

// components
import History from "../History";

const HistoryFileDialog = ({
  open,
  file,
  actions
}) => {
  const dialogActions = (
    <FlatButton
      label="閉じる"
      primary={true}
      onTouchTap={() => actions.toggleHistoryFileDialog() }
      />
  );

  const render = (history, idx) => {
    return (
      <History key={idx} history={history} />
    );
  };

  return (
    <Dialog
      title="履歴"
      open={open}
      modal={false}
      autoScrollBodyContent={true}
      actions={dialogActions} >

      {file.histories.map( (history, idx) => render(history, idx))}

    </Dialog>

  );
};

HistoryFileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object,
  actions: PropTypes.object
};

export default HistoryFileDialog;

