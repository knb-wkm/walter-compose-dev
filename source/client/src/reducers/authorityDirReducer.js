import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  dir: {}
};

const authorityDirReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_AUTHORITY_DIR_DIALOG:
    return state.open
      ? { ...state, open: !state.open }
      : { ...state, open: !state.open, dir: action.dir };
  default:
    return state;
  }
};

export default authorityDirReducer;
