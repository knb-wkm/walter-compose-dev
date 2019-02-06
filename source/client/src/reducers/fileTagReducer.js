import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {}
};

const fileTagReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_FILE_TAG_DIALOG:
    return state.open
      ? initialState
      : { open: !state.open, file: action.file };
  case actionTypes.INIT_FILE_TAG:
    return {
      open: state.open,
      file: action.file
    };
  default:
    return state;
  }
};

export default fileTagReducer;
