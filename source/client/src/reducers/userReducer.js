import * as actionTypes from "../actionTypes";

const initialState = {
  data: {
    enabled: true,
    name: "",
    account_name: "",
    email: "",
    password: "",
    groups: []
  },
  changed: {
    name: "",
    account_name: "",
    email: "",
    password: ""
  },
  errors: {}
};

const userReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_USER:
    return {
      ...state,
      data: { ...action.user, password: "" },
      changed: { ...action.user, password: "" }
    };
  case actionTypes.CHANGE_USER_NAME:
    return {
      ...state,
      changed: { ...state.changed, name: action.name }
    };
  case actionTypes.CHANGE_USER_ACCOUNT_NAME:
    return {
      ...state,
      changed: {
        ...state.changed,
        account_name: action.account_name
      }
    };
  case actionTypes.CHANGE_USER_PASSWORD:
    return {
      ...state,
      changed: { ...state.changed, password: action.password }
    };
  case actionTypes.CHANGE_USER_EMAIL:
    return {
      ...state,
      changed: { ...state.changed, email: action.email }
    };
  case actionTypes.CHANGE_USER_ROLE_ID:
    return {
      ...state,
      changed: { ...state.changed, role_id: action.role_id }
    };
  case actionTypes.INIT_NEW_USER_TEMPLATE:
    return {
      ...state,
      changed: {
        enabled: true,
        name: "",
        email: "",
        password: "",
        groups: []
      },
      errors: {}
    };
  case actionTypes.CHANGE_USER_VALIDATION_ERROR:
    return {
      ...state,
      errors: action.errors
    };
  case actionTypes.CLEAR_USER_VALIDATION_ERROR:
    return {
      ...state,
      errors: {}
    };
  default:
    return state;
  }
};

export default userReducer;
