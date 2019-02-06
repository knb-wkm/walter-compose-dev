import React from "react";
import PropTypes from "prop-types";

import TextField from "material-ui/TextField";

const SimpleSearch = ({
  hintText,
  history,
  actions,
  fileSimpleSearch
}) => {
  let searchValue = "";

  const defaultValue = ( fileSimpleSearch === undefined || fileSimpleSearch.search_value === undefined ) ? null : fileSimpleSearch.search_value.value;
  const handleKeyDown = (event) => {
    return event.key === "Enter"
      ? actions.searchFileSimple(searchValue.getValue(), history)
      : null;
  };

  return (
    <div>
      <TextField
        ref={(input) => searchValue = input}
        style={{width: 270}}
        onKeyPress={handleKeyDown}
        hintText={hintText}
        floatingLabelText="簡易検索"
        defaultValue={defaultValue}
        />
    </div>
  );
};

SimpleSearch.propTypes = {
  hintText: PropTypes.string,
  history: PropTypes.object,
  actions: PropTypes.object
};

export default SimpleSearch;

