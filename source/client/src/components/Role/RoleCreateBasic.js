import React from "react";
import PropTypes from "prop-types";

// material
import TextField from "material-ui/TextField";

const RoleCreateBasic = ({
  changedRole,
  validationErrors,
  actions
}) => {
  return (
    <div>
      <div>
        <TextField
          value={changedRole.name}
          onChange={(e, value) => actions.changeRoleName(value)}
          errorText={validationErrors.name}
          floatingLabelText="ロール名"
          />
      </div>
      <div>
        <TextField
          value={changedRole.description}
          onChange={(e, value) => actions.changeRoleDescription(value)}
          errorText={validationErrors.description}
          floatingLabelText="備考"
          />

      </div>
    </div>
  );
};

RoleCreateBasic.propTypes = {
  changedRole: PropTypes.object.isRequired,
  validationErrors: PropTypes.object.isRequired,
  changeRoleName: PropTypes.func.isRequired,
  changeRoleDescription: PropTypes.func.isRequired
};

export default RoleCreateBasic;
