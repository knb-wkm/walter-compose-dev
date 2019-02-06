import React from "react";
import PropTypes from "prop-types";

// material ui
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

// components
import Authority from "../Authority";

const AuthorityDirDialog = ({
  open,
  dir,
  users,
  roles,
  actions,
  session
}) => {
  const dialogActions = (
    <FlatButton
      label="閉じる"
      onTouchTap={actions.toggleAuthorityDirDialog}
      />
  );

  return (
    <Dialog
      title="権限を変更"
      modal={false}
      actions={dialogActions}
      open={open}
      onRequestClose={actions.toggleAuthorityDirDialog} >

      <Authority
        file={dir}
        users={users}
        roles={roles}
        addAuthorityToFile={actions.addAuthorityToFile}
        deleteAuthorityToFile={actions.deleteAuthorityToFile}
        triggerSnackbar={actions.triggerSnackbar}
        session={session} />

    </Dialog>
  );
};

AuthorityDirDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  dir: PropTypes.object,
  users: PropTypes.array.isRequired,
  roles: PropTypes.array.isRequired,
  actions: PropTypes.object
};

export default AuthorityDirDialog;
