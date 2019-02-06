import React from "react";
import PropTypes from "prop-types";

// material ui
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const MetaInfoDetailBasic = ({
  metaInfo,
  changedMetaInfo,
  validationErrors,
  valueTypes,
  changeMetaInfoLabel,
  changeMetaInfoName,
  changeMetaInfoValueType,
  saveMetaInfoName,
  saveMetaInfoLabel,
  actions,
  displaySaveButton = true
}) => {

  const saveNameBtn = (
    displaySaveButton
      ? (
        <FlatButton
          label="保存"
          primary={true}
          onClick={() => saveMetaInfoName(changedMetaInfo)}
        />
      )
    : null
  );

  const saveLabelBtn = (
    displaySaveButton
      ? (
        <FlatButton
          label="保存"
          primary={true}
          onClick={() => saveMetaInfoLabel(changedMetaInfo)}
        />
      )
    : null
  );

  return (
    <div>
      <div>
      <TextField
        value={changedMetaInfo.name}
        onChange={(e, value) => changeMetaInfoName(value)}
        floatingLabelText="メタ情報名"
        errorText={validationErrors.name}
        />

        {saveNameBtn}
      </div>
      <div>

        <TextField
          value={changedMetaInfo.label}
          onChange={(e, value) => changeMetaInfoLabel(value)}
          floatingLabelText="表示名"
          errorText={validationErrors.label}
          />

          {saveLabelBtn}

      </div>
      <div>

        <SelectField
          floatingLabelText="データ型"
          disabled={displaySaveButton}
          value={changedMetaInfo.value_type}
          errorText={validationErrors.value_type}
          onChange={(e, value) => changeMetaInfoValueType(valueTypes[value].name)}>

          {valueTypes.map( (type, id) => (
            <MenuItem key={id} value={type.name} primaryText={type.name} />
          ))}

        </SelectField>

      </div>
    </div>
  );
};

MetaInfoDetailBasic.propTypes = {
  metaInfo: PropTypes.object.isRequired
};

export default MetaInfoDetailBasic;
