import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {},
  errors: {}
};

const changeFileNameReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_CHANGE_FILE_NAME_DIALOG:
    return {
      open: !state.open,
      file: action.file,
      errors: {}
    };
  case actionTypes.CHANGE_FILE_NAME_ERROR:
    return {
      ...state,
      errors: action.errors
    };
  default:
    return state;
  }
};

export default changeFileNameReducer;
