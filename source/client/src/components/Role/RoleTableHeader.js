import React from "react";
import PropTypes from "prop-types";

// material ui
import { TableHeaderColumn, TableRow } from 'material-ui/Table';

const RoleTableHeader = ({
  headers
}) => {
  return (
    <TableRow>
      {headers.map( (header, idx) => (
        <TableHeaderColumn key={idx} style={{ width: header.width }}>
          {header.name}
        </TableHeaderColumn>
      ))}
    </TableRow>
  );
};

RoleTableHeader.propTypes = {
  headers: PropTypes.array.isRequired
};

export default RoleTableHeader;
