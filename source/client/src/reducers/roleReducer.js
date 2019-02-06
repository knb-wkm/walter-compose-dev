import * as actionTypes from "../actionTypes";

const initialState = {
  data: {
    actions: []
  },
  changed: {
    actions: []
  },
  errors: {}
};

const roleReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.INIT_ROLE:
    return {
      ...state,
      data: action.role,
      changed: action.role
    };
  case actionTypes.CHANGE_ROLE_NAME:
    return {
      ...state,
      changed: {
        ...state.changed,
        name: action.name
      }
    };
  case actionTypes.CHANGE_ROLE_DESCRIPTION:
    return {
      ...state,
      changed: {
        ...state.changed,
        description: action.description
      }
    };
  case actionTypes.SAVE_ROLE_VALIDATION_ERROR:
    return {
      ...state,
      errors: action.errors
    };
  case actionTypes.CLEAR_ROLE_VALIDATION_ERROR:
    return {
      ...state,
      errors: {}
    };
  case actionTypes.INIT_CREATE_ROLE:
    return initialState;
  default:
    return state;
  }
};

export default roleReducer;
