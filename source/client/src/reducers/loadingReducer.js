import * as actionTypes from "../actionTypes";

const initialState = {
  start: false,
  count: 0
};

const loadingReducer = (state = initialState, action) => {
  switch ( action.type ) {
    case actionTypes.LOADING_START:
    return {start: state.count + 1 > 0 , count:state.count + 1 };
  case actionTypes.LOADING_END:
    return {start: state.count - 1 > 0 , count:state.count - 1 };
  default:
    return state;
  }
};

export default loadingReducer;
