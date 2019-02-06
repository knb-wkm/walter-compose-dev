import * as actionTypes from "../actionTypes";

const dirsReducer = (state = [], action) => {

  switch (action.type) {
  case actionTypes.INIT_DIR:
    return action.dirs;
  default:
    return state;
  }
};

export default dirsReducer;
