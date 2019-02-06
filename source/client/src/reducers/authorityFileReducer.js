import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {}
};

const authorityFileReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.TOGGLE_AUTHORITY_FILE_DIALOG:
    return {
      file: action.file,
      open: !state.open
    };
  case actionTypes.INIT_AUTHORITY_FILE_DIALOG:
    return {
      ...state,
      file: action.file
    };
  default:
    return state;
  }
};

export default authorityFileReducer;
