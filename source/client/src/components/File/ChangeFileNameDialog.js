import React, { Component } from "react";
import PropTypes from "prop-types";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";
import TextField from "material-ui/TextField";

const ChangeFileNameDialog = ({
  open,
  file,
  actions,
  errors
}) => {
  let changedFileName;

  const btnActions = [
    (
      <FlatButton
        label="保存"
        primary={true}
        onTouchTap={() => actions.changeFileName(file, changedFileName.getValue())}
        />
    ),
    (
      <FlatButton
        label="閉じる"
        primary={false}
        onTouchTap={actions.toggleChangeFileNameDialog}
        />
    )
  ];

  return (
    <Dialog
      title="ファイル名編集"
      open={open}
      modal={false}
      actions={btnActions} >

      <div>
        <TextField
          ref={(input) => changedFileName = input}
          floatingLabelText="ファイル名を入力"
          errorText={errors.file_name}
          defaultValue={(file !== undefined && file.name !== undefined) ? file.name : ""}
          onKeyDown={ e => {
            return e.key === "Enter"
              ? actions.changeFileName(file, changedFileName.getValue())
              : null;
          }}
          />
      </div>

    </Dialog>
  );
};

ChangeFileNameDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object,
  actions: PropTypes.object.isRequired,
  errors: PropTypes.object
};

export default ChangeFileNameDialog;
