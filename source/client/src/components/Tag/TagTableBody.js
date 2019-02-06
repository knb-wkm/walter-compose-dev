import React from "react";
import PropTypes from "prop-types";

// router
import { Link } from "react-router-dom";

// material ui
import { TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import ImageEdit from "material-ui/svg-icons/image/edit";
import Avatar from "material-ui/Avatar";

const TagTableBody = ({ tag }) => {
  return (
    <TableRow>
      <TableRowColumn>{tag.label}</TableRowColumn>
      <TableRowColumn>
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <Avatar size={14} backgroundColor={tag.color} />
        </div>
      </TableRowColumn>
      <TableRowColumn>
        <IconButton containerElement={<Link to={`/tags/${tag._id}`} />}>
          <ImageEdit />
        </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

TagTableBody.propTypes = {
  tag: PropTypes.object.isRequired
};

export default TagTableBody;
