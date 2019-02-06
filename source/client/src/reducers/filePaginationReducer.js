import * as actionTypes from "../actionTypes";

const initialState = {
  total: 0,
  page: 0,
  yOffset: 0
};

const filePaginationReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.INIT_FILE_TOTAL:
    return {
      ...state,
      total: action.total
    };
  case actionTypes.FILE_NEXT_PAGE:
    return {
      ...state,
      page: state.page + 1
    };
  case actionTypes.SET_PAGE_Y_OFFSET:
    return {
      ...state,
      yOffset: action.yOffset
    };
  case actionTypes.INIT_FILE_PAGINATION:
    return initialState;
  default:
    return state;
  }
};

export default filePaginationReducer;
