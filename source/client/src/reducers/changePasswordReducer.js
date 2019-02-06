import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  errors: {}
};

const changePasswordReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_CHANGE_PASSWORD_DIALOG:
    return {
      ...state,
      open: !state.open
    };
  case actionTypes.CHANGE_PASSWORD_SUCCESS:
    return {
      ...state,
      open: !state.open,
      errors: {}
    };
  case actionTypes.CHANGE_PASSWORD_FAILED:
    return {
      ...state,
      errors: action.errors
    };
  default:
    return state;
  }
};

export default changePasswordReducer;
