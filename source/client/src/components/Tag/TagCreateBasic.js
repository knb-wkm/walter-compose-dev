import React from "react";
import PropTypes from "prop-types";

import TextField from "material-ui/TextField";
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardText } from "material-ui/Card";
import { CirclePicker } from "react-color";

const TagCreateBasic = ({
  changedTag,
  validationErrors,
  pickerOpen,
  actions
}) => {
  const circlePicker = pickerOpen ? (
    <Card style={{ marginTop: 20 }}>
      <CardText>
        <CirclePicker
          style={{ marginTop: 20 }}
          color={changedTag.color}
          onChangeComplete={actions.toggleColorPicker}
          onChange={ color => (
            actions.changeTagColor(color.hex)
          )}
          />
      </CardText>
    </Card>
  ) : null;

  return (
    <div>
      <div>
        <TextField
          value={changedTag.label}
          onChange={(e, value) => actions.changeTagLabel(value)}
          errorText={validationErrors.label}
          floatingLabelText="タグ名"
          />
      </div>
      <div>
        <RaisedButton
          label="色を設定"
          labelColor="rgb(255, 255, 255)"
          backgroundColor={changedTag.color === undefined ? "#aaa" : changedTag.color}
          style={{ marginTop: 20 }}
          onClick={actions.toggleColorPicker}
          />
      </div>

      {circlePicker}
    </div>
  );
};

TagCreateBasic.propTypes = {
  changedTag: PropTypes.object.isRequired,
  validationErrors: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default TagCreateBasic;
