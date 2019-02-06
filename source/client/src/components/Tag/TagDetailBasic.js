import React from "react";
import PropTypes from "prop-types";

import TextField from "material-ui/TextField";
import FloatingActionButton from 'material-ui/FloatingActionButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from "material-ui/FlatButton";
import { Card, CardText } from "material-ui/Card";
import { CirclePicker } from "react-color";

const TagDetailBasic = ({
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
        <FlatButton
          label="保存"
          primary={true}
          onClick={() => actions.saveTagLabel(changedTag)}
          />
      </div>
      <div>
        <RaisedButton
          label="色を設定"
          labelColor="rgb(255, 255, 255)"
          backgroundColor={changedTag.color}
          style={{ marginTop: 20 }}
          onClick={actions.toggleColorPicker}
          />

        <FlatButton
          label="保存"
          primary={true}
          onClick={() => actions.saveTagColor(changedTag)}
          />
      </div>

      {circlePicker}
    </div>
  );
};

TagDetailBasic.propTypes = {
  changedTag: PropTypes.object.isRequired,
  validationErrors: PropTypes.object.isRequired
};

export default TagDetailBasic;
