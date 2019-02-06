import * as actionTypes from "../actionTypes";

const initialState = {
  sorted: null,
  desc: false
};

const fileSortTargetReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.SET_SORT_TARGET:
    return {
      sorted: action.sorted,
      desc: !state.desc
    };
  case actionTypes.TOGGLE_SORT_TARGET:
    return {
      sorted: state.sorted,
      desc: !state.desc
    };
  default:
    return state;
  }
};

export default fileSortTargetReducer;
