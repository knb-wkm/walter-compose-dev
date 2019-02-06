import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {}
};

const restoreFileReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_RESTORE_FILE_DIALOG:
    return action.file === undefined
      ? {
        open: !state.open,
        file: initialState.file
      } : {
        open: !state.open,
        file: action.file
      };
  default:
    return state;
  }
};

export default restoreFileReducer;
