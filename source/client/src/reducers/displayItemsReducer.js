import * as actionTypes from "../actionTypes";

const displayItemsReducer = (state = [], action) => {
  switch (action.type) {
  case actionTypes.INIT_DISPLAY_ITEMS:
    return action.displayItems;
  default:
    return state;
  }
};

export default displayItemsReducer;
