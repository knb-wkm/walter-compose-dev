import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  message: "",
  duration: 3000
};

const snackbarReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.CLOSE_SNACK:
    return {
      ...state,
      open: false
    };
  case actionTypes.INIT_SNACK:
    return {
      ...state,
      open: true,
      message: action.message
    };
  default:
  return state;
  }
};

export default snackbarReducer;
