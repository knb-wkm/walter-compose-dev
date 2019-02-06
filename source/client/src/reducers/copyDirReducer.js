import * as actionTypes from "../actionTypes";

const initialState = {
  open: false
};

const copyDirReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_COPY_DIR_DIALOG:
    return {
      ...state,
      open: !state.open
    };
  default:
    return state;
  }
};

export default copyDirReducer;
