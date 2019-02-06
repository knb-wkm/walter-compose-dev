import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {}
};

const copyFileReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_COPY_FILE_DIALOG:
    return state.open
      ? { ...state, open: !state.open, file: initialState }
      : { ...state, open: !state.open, file: state.file };
  default:
    return state;
  }
};

export default copyFileReducer;
