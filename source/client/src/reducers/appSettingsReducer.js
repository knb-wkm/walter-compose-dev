import * as actionTypes from "../actionTypes";

const initialState = [];

const appSettingsReducer = (state = initialState, action) => {
  switch ( action.type ) {
  case actionTypes.INIT_APP_SETTINGS:
    return action.settings.map( s => {
      return { ...s, value: s.default_value };
    });
  case actionTypes.TOGGLE_DISPLAY_UNVISIBLE_FILES:
    return state.map( s => {
      if (s.name === "unvisible_files_toggle") {
        return { ...s, value: action.checked };
      }
      else {
        return s;
      }
    });
  default:
    return state;
  }
};

export default appSettingsReducer;
