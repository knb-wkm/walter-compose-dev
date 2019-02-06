import React from "react";
import PropTypes from "prop-types";

// material
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";

const RoleMenuCreateBasic = ({
  changedRoleMenu,
  validationErrors,
  roleMenuActions
}) => {
    return (
    <div>
      <div>
        <TextField
          value={changedRoleMenu.name}
          onChange={(e, value) => roleMenuActions.changeRoleMenuName(value)}
          errorText={validationErrors.name}
          floatingLabelText="メニュー名"
        />
      </div>
      <div>
        <TextField
          value={changedRoleMenu.description}
          onChange={(e, value) => roleMenuActions.changeRoleMenuDescription(value)}
          errorText={validationErrors.description}
          floatingLabelText="備考"
        />
      </div>

    </div>
  );
};

export default RoleMenuCreateBasic;