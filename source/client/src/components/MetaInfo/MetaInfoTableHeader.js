import React from "react";
import PropTypes from "prop-types";

import { TableHeaderColumn, TableRow } from "material-ui/Table";

const MetaInfoTableHeader = ({ headers }) => {
  return (
    <TableRow>
      {headers.map( (header, idx) => (
        <TableHeaderColumn key={idx}>
          {header.name}
        </TableHeaderColumn>
      ))}
    </TableRow>
  );
};

MetaInfoTableHeader.propTypes = {
  headers: PropTypes.array.isRequired
};

export default MetaInfoTableHeader;
