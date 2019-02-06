import * as actionTypes from "../actionTypes";

const initialState = [];

const filesBufferReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.PUSH_FILE_TO_BUFFER:
    return [ ...state, action.file ];
  case actionTypes.POP_FILE_TO_BUFFER:
    return state.filter( buf => buf._id !== action.file._id );
  case actionTypes.CLEAR_FILES_BUFFER:
    return initialState;
  default:
    return state;
  }
};

export default filesBufferReducer;

