import * as actionTypes from "../actionTypes";

const initialState = {
  data: {
    belongs_to: []
  },
  changed: {
    belongs_to: []
  },
  errors: {}
};

const groupReducer = (state = initialState, action) => {
  switch ( action.type ) {

  case actionTypes.INIT_GROUP:
    return {
      ...state,
      data: action.group,
      changed: action.group
    };

  case actionTypes.CHANGE_GROUP_NAME:
    return {
      ...state,
      changed: {
        ...state.changed,
        name: action.name
      }
    };

  case actionTypes.CHANGE_GROUP_DESCRIPTION:
    return {
      ...state,
      changed: {
        ...state.changed,
        description: action.description
      }
    };

  case actionTypes.SAVE_GROUP_VALIDATION_ERROR:
    return {
      ...state,
      errors: action.errors
    };
  case actionTypes.CLEAR_GROUP_VALIDATION_ERROR:
    return {
      ...state,
      errors: {}
    };
  case actionTypes.INIT_CREATE_GROUP:
    return {
      ...state,
      changed: initialState.changed
    };
  case actionTypes.CLEAR_CHANGE_GROUP_DATA:
    return initialState;
  default:
    return state;
  }
};

export default groupReducer;

