import React from "react";
import PropTypes from "prop-types";

// material
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";

const RoleDetailBasic = ({
  role,
  changedRole,
  validationErrors,
  roleActions
}) => {

  return (
    <div>
      <TextField
        value={changedRole.name}
        onChange={(e, value) => roleActions.changeRoleName(value)}
        errorText={validationErrors.name}
        floatingLabelText="ロール名"
        />

      <FlatButton
        label="保存"
        primary={true}
        onClick={() => roleActions.saveRoleName(changedRole)}
        />

      <TextField
        value={changedRole.description}
        onChange={(e, value) => roleActions.changeRoleDescription(value)}
        errorText={validationErrors.description}
        floatingLabelText="備考"
        />

      <FlatButton
        label="保存"
        primary={true}
        onClick={() => roleActions.saveRoleDescription(changedRole)}
        />

    </div>
  );
};

RoleDetailBasic.propTypes = {
  role: PropTypes.object.isRequired,
  changedRole: PropTypes.object.isRequired,
  validationErrors: PropTypes.object.isRequired,
  roleActions: PropTypes.object.isRequired
};

export default RoleDetailBasic;
