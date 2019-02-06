import * as actionTypes from "../actionTypes";

const baseStruct = {
  label: null, value_type: null
};

const initialState = {
  metaInfo: baseStruct,
  changedMetaInfo: baseStruct,
  validationErrors: baseStruct,
  meta_infos: [],
  valueTypes: [
    { name: "String" },
    { name: "Date" },
    { name: "Number" }
  ],
  target_file: null,
  dialog_open: false
};

const metaInfoReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_META_INFO:
    return {
      ...state,
      metaInfo: action.meta_info,
      changedMetaInfo: action.meta_info
    };
  case actionTypes.INIT_META_INFOS:
    return {
      ...state,
      meta_infos: action.meta_infos
    };
  case actionTypes.TOGGLE_META_INFO_DIALOG:
    return {
      ...state,
      target_file: action.target_file,
      dialog_open: !state.dialog_open
    };
  case actionTypes.UPDATE_META_INFO_TARGET:
    return {
      ...state,
      target_file: action.target_file
    };
  case actionTypes.CHANGE_META_INFO_NAME:
    return {
      ...state,
      changedMetaInfo: {
        ...state.changedMetaInfo,
        name: action.name
      }
    };
  case actionTypes.CHANGE_META_INFO_LABEL:
    return {
      ...state,
      changedMetaInfo: {
        ...state.changedMetaInfo,
        label: action.label
      }
    };
  case actionTypes.CHANGE_META_INFO_VALUE_TYPE:
    return {
      ...state,
      changedMetaInfo: {
        ...state.changedMetaInfo,
        value_type: action.value_type
      }
    };
  case actionTypes.INIT_CHANGED_META_INFO:
    return {
      ...state,
      changedMetaInfo: baseStruct
    };
  case actionTypes.SAVE_META_INFO_VALIDATION_ERRORS:
    return {
      ...state,
      validationErrors: action.errors
    };
  case actionTypes.CLEAR_META_INFO_VALIDATION_ERRORS:
    return {
      ...state,
      validationErrors: {}
    };
  default:
    return state;
  }
};

export default metaInfoReducer;
