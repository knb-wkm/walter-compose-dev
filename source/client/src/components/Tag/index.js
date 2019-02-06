import React from "react";
import PropTypes from "prop-types";

// material-ui
import SelectField from "material-ui/SelectField";
import Chip from "material-ui/Chip";
import MenuItem from "material-ui/MenuItem";

const styles = {
  row: {
    marginTop: 10,
    display: "flex"
  },
  cell: {
    marginRight: 20,
    width: "20%"
  }
};

const Tag = ({
  file,
  tags,
  actions
}) => {

  const renderTag = (tag, idx) => {
    return (
      <Chip
        key={idx}
        style={{marginLeft: 10}}
        onRequestDelete={() => actions.requestDelTag(file, tag)}
        >
        {tag.label}
      </Chip>
    );
  };

  const renderMenuItem = (tag, idx) => {
    return (
      <MenuItem key={idx} value={tag} primaryText={tag.label} />
    );
  };

  const _tags = tags.filter(tag => !file.tags.map( t => t._id ).includes(tag._id));

  const addTagButton = () => {
    const editable = file.actions.filter( act => (
      act.name === "change-tag"
    )).length > 0;

    return editable
      ? (
      <SelectField
        floatingLabelText="タグを追加"
        value={""}
        onChange={(e, idx, value) => actions.requestAddTag(file, value)} >
        {_tags.map( (tag, idx) => renderMenuItem(tag, idx) )}
      </SelectField>
      ) : null;
  };

  return (
    <div>
      <div style={{...styles.row, display: "flex"}}>
        {file.tags.map( (tag, idx) => renderTag(tag, idx) )}
      </div>
      {addTagButton()}
    </div>
  );
};

Tag.propTypes = {
  file: PropTypes.object,
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

export default Tag;
