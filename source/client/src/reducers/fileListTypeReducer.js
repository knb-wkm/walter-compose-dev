import * as actionTypes from "../actionTypes";

const initialState = {
  list_type:""
};

const fileListTypeReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_FILE_LIST_TYPE:
      state.list_type = action.list_type;
      return state;
    case actionTypes.INIT_FILE_LIST_TYPE:
      return initialState;
    default:
      return state;
  }
};

export default fileListTypeReducer;

