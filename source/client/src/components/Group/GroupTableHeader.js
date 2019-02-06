import React from "react";
import PropTypes from "prop-types";

// material
import { TableHeaderColumn, TableRow } from 'material-ui/Table';

const GroupTableHeader = ({ headers }) => {
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

GroupTableHeader.propTypes = {
  headers: PropTypes.array.isRequired
};

export default GroupTableHeader;
