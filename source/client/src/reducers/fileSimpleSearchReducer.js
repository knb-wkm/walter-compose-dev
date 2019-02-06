import * as actionTypes from "../actionTypes";

const fileSimpleSearchReducer = (state = [], action) => {
  switch ( action.type ) {

    case actionTypes.KEEP_FILE_SIMPLE_SEARCH_VALUE:
      return { search_value: action.value  };
    default:
      return state;
  }

};

export default fileSimpleSearchReducer;