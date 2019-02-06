import React from "react";
import PropTypes from "prop-types";

// material ui
import Dialog from "material-ui/Dialog";
import FlatButton from 'material-ui/FlatButton';
import TextField from "material-ui/TextField";

// // components
// import Account from "../Account";

const AccountDialog = ({
  changePasswordStore,
  handleClose,
  requestChangePassword
}) => {
  let currentPassword;
  let newPassword;

  const handleSaveClick = () => {
    const cur_pwd = currentPassword.getValue();
    const new_pwd = newPassword.getValue();

    requestChangePassword(cur_pwd, new_pwd);
  };

  const actions = [
    (
      <FlatButton
        label="閉じる"
        onTouchTap={handleClose}
        />
    ),
    (
      <FlatButton
        label="保存"
        primary={true}
        onTouchTap={handleSaveClick} />
    )
  ];

  return (
    <Dialog
      title="アカウント情報変更"
      modal={true}
      actions={actions}
      open={changePasswordStore.open}
      onRequestClose={handleClose}
      >

      <TextField
        ref={(input) => currentPassword = input}
        hintText=""
        floatingLabelText="現在のパスワード"
        errorText={changePasswordStore.errors.current_password}
        type="password"
        />

      <br />

      <TextField
        ref={(input) => newPassword = input}
        hintText=""
        floatingLabelText="新しいパスワード"
        errorText={changePasswordStore.errors.new_password}
        type="password"
        />

    </Dialog>
  );
};

AccountDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  requestChangePassword: PropTypes.func.isRequired
};

export default AccountDialog;
