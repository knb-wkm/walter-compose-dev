import * as actionTypes from "../actionTypes";

const initialState = {
  open: false
};

const moveFilesReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_MOVE_FILES_DIALOG:
    return {
      ...state,
      open: !state.open
    };
  default:
    return state;
  }
};

export default moveFilesReducer;
