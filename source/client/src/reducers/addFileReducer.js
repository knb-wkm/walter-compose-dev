import * as actionTypes from "../actionTypes";

const addFileReducer = (state = { open: false }, action) => {
  switch (action.type) {
  case actionTypes.TOGGLE_ADD_FILE:
    return {
      open: !state.open
    };
  default:
    return state;
  }
};

export default addFileReducer;
