import * as actionTypes from "../actionTypes";

const initialState = {
  open: false
};

const deleteFilesReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.TOGGLE_DELETE_FILES_DIALOG:
    return {
      ...state,
      open: !state.open
    };
  default:
    return state;
  }
};

export default deleteFilesReducer;
