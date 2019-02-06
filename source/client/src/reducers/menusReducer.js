import * as actionTypes from "../actionTypes";

const initialState = [];

const menusReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_MENUS:
    return action.menus;
  default:
    return state;
  }
};

export default menusReducer;
