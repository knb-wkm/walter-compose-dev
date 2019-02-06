import React from "react";
import PropTypes from "prop-types";

// router
import { Link } from "react-router-dom";

// material ui
import { TableRow, TableRowColumn } from 'material-ui/Table';

import Chip from 'material-ui/Chip';
import IconButton from 'material-ui/IconButton';
import ImageEdit from "material-ui/svg-icons/image/edit";

const GroupTableBody = ({ group, key, headers }) => {
  const renderUser = (user, key) => {
    return (
      <Chip key={key} style={{ marginRight: 10, marginTop: 5, marginBottom: 5 }}>
        {user.name}
      </Chip>
    );
  };

  return (
    <TableRow>
      <TableRowColumn style={{ width: headers[0].width }}>
        {group.name}
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[1].width }}>
        {group.description}
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[2].width }}>
        <div>{group.belongs_to.length}人のユーザ</div>
      </TableRowColumn>
      <TableRowColumn style={{ width: headers[3].width }}>
        <IconButton containerElement={<Link to={`/groups/${group._id}`} />}>
          <ImageEdit />
        </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

GroupTableBody.propTypes = {
  group: PropTypes.object.isRequired
};

export default GroupTableBody;
