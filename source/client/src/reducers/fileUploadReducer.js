import * as actionTypes from "../actionTypes";

const initialState = {
  blob: null
};

const fileUploadReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.PUT_BINARY_FILE:
    return {
      ...state,
      blob: action.blob
    };
  default:
    return state;
  }
};

export default fileUploadReducer;
