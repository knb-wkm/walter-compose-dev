import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {}
};

const moveFileReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_MOVE_FILE_DIALOG:
    return state.open
      ? { ...state, open: !state.open, file: {} }
    : { ...state, open: !state.open, file: action.file };
  default:
    return state;
  }
};

export default moveFileReducer;
