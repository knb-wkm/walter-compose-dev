import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {
    histories: []
  }
};

const fileHistoryReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_HISTORY_FILE_DIALOG:
    return state.open
      ? initialState
      : { ...state, open: !state.open, file: action.file };
  default:
    return state;
  }
};

export default fileHistoryReducer;
