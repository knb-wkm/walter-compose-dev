import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  message: "",
  detail: null
};

const exceptionReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_EXCEPTION:
    return {
      open: true,
      message: action.message,
      detail: action.detail
    };
  case actionTypes.CLOSE_EXCEPTION:
    return initialState;
  default:
    return state;
  }
};

export default exceptionReducer;
