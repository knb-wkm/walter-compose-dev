import * as actionTypes from "../actionTypes";

const initialState = {
  id: null
};

const selectedDirReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.SELECT_DIR_TREE:
    return action.dir;
  default: 
    return state;
  }
};

export default selectedDirReducer;
