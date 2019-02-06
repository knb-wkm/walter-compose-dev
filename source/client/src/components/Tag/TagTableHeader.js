import React from "react";
import PropTypes from "prop-types";

// material
import { TableHeaderColumn, TableRow } from 'material-ui/Table';

const TagTableHeader = ({ headers }) => {
  return (
    <TableRow>
      {headers.map( (header, idx) => (
        <TableHeaderColumn key={idx}>{header.name}</TableHeaderColumn>
      ))}
    </TableRow>
  );
};

TagTableHeader.propTypes = {
  headers: PropTypes.array.isRequired
};

export default TagTableHeader;
