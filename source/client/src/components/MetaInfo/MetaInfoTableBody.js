import React from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

// material ui
import { TableRow, TableRowColumn } from "material-ui/Table";
import IconButton from "material-ui/IconButton";
import ImageEdit from "material-ui/svg-icons/image/edit";

const MetaInfoTableBody = ({ meta, key }) => {
  return (
    <TableRow>
      <TableRowColumn>{meta.label}</TableRowColumn>
      <TableRowColumn>{meta.value_type}</TableRowColumn>
      <TableRowColumn>
        <IconButton
          containerElement={<Link to={`/meta_infos/${meta._id}`} />}
        >
          <ImageEdit />
        </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

MetaInfoTableBody.propTypes = {
  meta: PropTypes.object.isRequired
};

export default MetaInfoTableBody;
