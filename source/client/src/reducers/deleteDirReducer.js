import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  dir: {}
};

const deleteDirReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_DELETE_DIR_DIALOG:
    return state.open
      ? { ...state, open: !state.open }
    : { ...state, dir: action.dir, open: !state.open};
  default:
    return state;
  }
};

export default deleteDirReducer;

      
