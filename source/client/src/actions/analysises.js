import * as actionTypes from "../actionTypes";

export const requestFetchAnalysis = (reported_at) => ({
  type: actionTypes.REQUEST_FETCH_ANALYSIS, reported_at
});

export const requestFetchAnalysisPeriod = (start_date, end_date) => ({
  type: actionTypes.REQUEST_FETCH_ANALYSIS_PERIOD, start_date, end_date
});

export const initAnalysis = (analysis) => ({
  type: actionTypes.INIT_ANALYSIS, analysis
});

export const initAnalysisPeriod = (analysisPeriod) => ({
  type: actionTypes.INIT_ANALYSIS_PERIOD, analysisPeriod
});
