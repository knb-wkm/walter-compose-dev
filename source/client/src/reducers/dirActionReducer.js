import * as actionTypes from "../actionTypes";

const initialState = {
  actions:[]
};

const dirActionReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_DIR_ACTION:
      state.actions = action.actions;
      return state;

    default:
      return initialState;
  }
};

export default dirActionReducer;