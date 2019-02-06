import * as actionTypes from "../actionTypes";

const initialState = {
  data:[]
};

const roleMenusReducer = (state = initialState,action) => {
  switch(action.type) {
    case actionTypes.INIT_ROLE_MENUS:
      return {
        ...state,
        data: action.roleMenus
      };
    default:
      return state;
  }
};

export default roleMenusReducer;