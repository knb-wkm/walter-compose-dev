import * as actionTypes from "../actionTypes";

const initState = {
  notifications:[],
  unread: 0,
  open: { open:false }
};

const notificationsReducer = (state = initState, action) => {
  switch (action.type) {
  case actionTypes.TOGGLE_NOTIFICATIONS:
    return state;
  case actionTypes.INIT_NOTIFICAITON:
    return {
      ...state,
      notifications: action.notifications,
      unread: action.status.unread,
      total: action.status.total,
      page: action.status.page
    };
  case actionTypes.INIT_MORE_NOTIFICAITON:
    const notifications = state.notifications.concat(action.notifications);
    return {
      ...state,
      notifications: notifications,
      unread: action.status.unread,
      total: action.status.total,
      page: action.status.page
    };
  case actionTypes.OPEN_NOTIFICATIONS:
    return {
      ...state,
      open: {
        open:true
      }
    };
  case actionTypes.CLOSE_NOTIFICATIONS:
    return {
      ...state,
      open: {
        open:false
      }
    };
  default:
    return state;
  }
};

export default notificationsReducer;
