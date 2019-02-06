import * as actionTypes from "../actionTypes";

const initialState = {
  open: false
};

const downloadFilesReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.TOGGLE_DOWNLOAD_FILES_DIALOG:
    return {
      ...state,
      open: !state.open
    };
  default:
    return state;
  }
};

export default downloadFilesReducer;
