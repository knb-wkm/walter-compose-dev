import React from "react";
import PropTypes from "prop-types";

// router
import { Link } from "react-router-dom";

// material ui
import { TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import ImageEdit from "material-ui/svg-icons/image/edit";
import Chip from "material-ui/Chip";

const RoleTableBody = ({
  role,
  key,
  headers
}) => {
  return (
    <TableRow key={key}>
      <TableRowColumn style={{ width: headers[0].width }}>
        {role.name}
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[1].width }}>
        {role.description}
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[2].width }}>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {role.actions.map( (action, idx) => {
            return (
              <Chip key={idx} style={{ marginRight: 10, marginTop: 5, marginBottom: 5 }}>
                {action.label}
              </Chip>
            );
          })}
        </div>
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[3].width }}>
        <IconButton containerElement={<Link to={`/role_files/${role._id}`} />}>
          <ImageEdit />
        </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

RoleTableBody.propTypes = {
  role: PropTypes.object.isRequired
};

export default RoleTableBody;
