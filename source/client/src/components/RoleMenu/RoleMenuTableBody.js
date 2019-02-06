import React from "react";
import PropTypes from "prop-types";

// router
import { Link } from "react-router-dom";

// material ui
import { TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import ImageEdit from "material-ui/svg-icons/image/edit";
import Chip from "material-ui/Chip";


const RoleMenuTableBody = ({
  roleMenu,
  key,
  headers
}) => {
  return (
    <TableRow key={key}>
      <TableRowColumn style={{ width: headers[0].width }}>
        {roleMenu.name}
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[1].width }}>
        {roleMenu.description}
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[2].width }}>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          { roleMenu.menus.map( (menus, idx) => {
            return (
              <Chip
                key={idx}
                style={{ marginRight: 10, marginTop: 5, marginBottom: 5 }}>
                {menus.label}
              </Chip>
            );
          })}
        </div>
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[3].width }}>
          <IconButton containerElement={<Link to={`/role_menus/${roleMenu._id}`} />}>
            <ImageEdit />
          </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

RoleMenuTableBody.propTypes = {
  roleMenu: PropTypes.object.isRequired
};

export default RoleMenuTableBody;
