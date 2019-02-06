import * as actionTypes from "../actionTypes";

const initialState = {
  data: {},
  changedTag: { color: "#aaa" },
  validationErrors: {},
  pickerOpen: false
};

const tagReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_TAG:
    return action.tag === undefined || action.tag._id === undefined
      ? initialState
      : {
        data: action.tag,
        changedTag: action.tag,
        validationErrors: {}
      };
  case actionTypes.CHANGE_TAG_LABEL:
    return {
      ...state,
      changedTag: {
        ...state.changedTag,
        label: action.value
      }
    };
  case actionTypes.CHANGE_TAG_COLOR:
    return {
      ...state,
      changedTag: {
        ...state.changedTag,
        color: action.value
      }
    };
  case actionTypes.SAVE_TAG_VALIDATION_ERROR:
    return {
      ...state,
      validationErrors: {
        ...state.validationErrors,
        ...action.errors
      }
    };
  case actionTypes.TOGGLE_COLOR_PICKER:
    return {
      ...state,
      pickerOpen: !state.pickerOpen
    };
  default:
    return state;
  }
};

export default tagReducer;
