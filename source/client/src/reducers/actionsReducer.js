import * as actionTypes from "../actionTypes";

const initialState = [];

const actionsReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_ACTIONS:
    return action.actions;
  default:
    return state;
  }
};

export default actionsReducer;
