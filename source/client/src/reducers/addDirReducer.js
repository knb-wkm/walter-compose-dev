import * as actionTypes from "../actionTypes";

const addDirReducer = (state = { open: false }, action) => {
  switch (action.type) {
  case actionTypes.TOGGLE_ADD_DIR:
    return {
      open: !state.open
    };
  default:
    return state;
  }
};

export default addDirReducer;
