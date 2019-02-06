import * as actionTypes from "../actionTypes";

const initialState = {
  open: false,
  file: {
    meta_infos: []
  }
};

const fileMetaInfoReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.TOGGLE_FILE_META_INFO_DIALOG:
    return state.open
      ? initialState
      : { open: !state.open, file: action.file };
  case actionTypes.INIT_FILE_META_INFO:
    return {
      ...state,
      file: action.file
    };
  default:
    return state;
  }
};

export default fileMetaInfoReducer;
