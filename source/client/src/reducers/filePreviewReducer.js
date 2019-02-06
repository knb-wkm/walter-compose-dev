import * as actionTypes from "../actionTypes";

const initialState = {
  preview_id: null,
  loading: false,
  body: null,
  errors: null
};

const filePreviewReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_FILE_PREVIEW:
    return initialState;
  case actionTypes.TOGGLE_LOADING_FILE_PREVIEW:
    return {
      ...state,
      loading: !state.loading
    };
  case actionTypes.INIT_FILE_PREVIEW_BODY:
    return {
      ...state,
      body: action.body
    };
  case actionTypes.FILE_PREVIEW_ERROR:
    return {
      ...state,
      errors: action.errors
    };
  default:
    return state;
  }
};

export default filePreviewReducer;
