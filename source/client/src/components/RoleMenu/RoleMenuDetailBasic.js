import React from "react";
import PropTypes from "prop-types";

// material
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";

const RoleMenuDetailBasic = ({
  roleMenu,
  changedMenu,
  validationErrors,
  roleMenuActions
}) => {
    return (
    <div>
      <TextField
        value={changedMenu.name}
        onChange={(e, value) => roleMenuActions.changeRoleMenuName(value)}
        errorText={validationErrors.name}
        floatingLabelText="メニュー名"
      />
      <FlatButton
        label="保存"
        primary={true}
        onClick={() => roleMenuActions.saveRoleMenuName(changedMenu)}
      />
      <TextField
        value={changedMenu.description}
        onChange={(e, value) => roleMenuActions.changeRoleMenuDescription(value)}
        errorText={validationErrors.description}
        floatingLabelText="備考"
      />
      <FlatButton
        label="保存"
        primary={true}
        onClick={() => roleMenuActions.saveRoleMenuDescription(changedMenu)}
      />
    </div>
  );
};

export default RoleMenuDetailBasic;