import React from "react";
import PropTypes from "prop-types";

// material
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

const GroupDetailBasic = ({
  changedGroup,
  validationErrors,
  actions,
  displaySaveButton = true
}) => {
  return (
    <div>
      <TextField
        value={changedGroup.name}
        onChange={(e, value) => actions.changeGroupName(value)}
        errorText={validationErrors.name}
        floatingLabelText="グループ名"
        />

        { displaySaveButton ?
          (
            <FlatButton 
              label="保存"
              onClick={() => {
                actions.saveGroupName(changedGroup);
              }}
              primary={true} />
          ) : null}

      <TextField
        value={changedGroup.description}
        onChange={(e, value) => actions.changeGroupDescription(value)}
        floatingLabelText="備考"
        />

    { displaySaveButton ?
      (
        <FlatButton
          label="保存"
          onClick={() => {
            actions.saveGroupDescription(changedGroup);
          }}
          primary={true} />
      ) : null}

    </div>
  );
};

GroupDetailBasic.propTypes = {
  changedGroup: PropTypes.object.isRequired,
  validationErrors: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  displaySaveButton: PropTypes.bool
};

export default GroupDetailBasic;
