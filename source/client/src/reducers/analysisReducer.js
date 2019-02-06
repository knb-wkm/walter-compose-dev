import * as actionTypes from "../actionTypes";

const initialState = {
  daily: {
    useRateTotal: [],
    fileCount: [],
    folderCount: [],
    useRateFolder: [],
    useRateTag: [],
    useRateMimeType: [],
    useRateUser: [],
    usages: []
  },
  period: []
};

const analysisReducer = (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.INIT_ANALYSIS:
    return {
      ...state,
      daily: action.analysis
    };
  case actionTypes.INIT_ANALYSIS_PERIOD:
    return {
      ...state,
      period: action.analysisPeriod
    };
  default:
    return state;
  }
};

export default analysisReducer;
