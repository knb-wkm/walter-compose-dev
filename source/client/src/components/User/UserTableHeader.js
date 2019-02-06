import React from "react";
import PropTypes from "prop-types";

import {
  TableRow,
  TableHeaderColumn,
} from 'material-ui/Table';

const UserTableHeader = ({ headers }) => {
  return (
    <TableRow>
      {headers.map( (header, idx) => {
        return (
          <TableHeaderColumn
            style={{ width: header.width }}
            key={idx}>{header.name}
          </TableHeaderColumn>
        );
      })}
    </TableRow>
  );
};

UserTableHeader.propTypes = {
  headers: PropTypes.array.isRequired
};

export default UserTableHeader;
