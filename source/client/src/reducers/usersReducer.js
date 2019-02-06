import * as actionTypes from "../actionTypes";

const usersReducer = (state = [], action) => {
  switch ( action.type ) {
  case actionTypes.INIT_USERS:
    return action.users;
  default:
    return state;
  }
};

export default usersReducer;
