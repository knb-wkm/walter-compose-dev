import * as actionTypes from "../actionTypes";

export const requestFetchGroups = (tenant_id) => ({
  type: actionTypes.REQUEST_FETCH_GROUPS, tenant_id
});

export const requestFetchGroup = (group_id) => ({
  type: actionTypes.REQUEST_FETCH_GROUP, group_id
});

export const requestFetchUsers = () => ({
  type: actionTypes.REQUEST_FETCH_USERS
});

export const searchGroupSimple = (keyword) => ({
  type: actionTypes.SEARCH_GROUP_SIMPLE, keyword
});

export const changeGroupName = (name) => ({
  type: actionTypes.CHANGE_GROUP_NAME, name
});

export const changeGroupDescription = (description) => ({
  type: actionTypes.CHANGE_GROUP_DESCRIPTION, description
});

export const saveGroupName = (group) => ({
  type: actionTypes.SAVE_GROUP_NAME, group
});

export const saveGroupDescription = (group) => ({
  type: actionTypes.SAVE_GROUP_DESCRIPTION, group
});

export const saveGroupValidationError = (errors) => ({
  type: actionTypes.SAVE_GROUP_VALIDATION_ERROR, errors
});

export const clearGroupValidationError = () => ({
  type: actionTypes.CLEAR_GROUP_VALIDATION_ERROR
});

export const createGroup = (group, history) => ({
  type: actionTypes.CREATE_GROUP, group, history
});

export const deleteGroup = (group_id, history) => ({
  type: actionTypes.DELETE_GROUP, group_id, history
});

export const addGroupOfUser = (user_id, group_id) => ({
  type: actionTypes.ADD_GROUP_OF_USER, user_id, group_id
});

export const deleteGroupOfUser = (user_id, group_id) => ({
  type: actionTypes.DELETE_GROUP_OF_USER, user_id, group_id
});

export const initGroup = (group) => ({
  type: actionTypes.INIT_GROUP, group
});

export const initGroups = (groups) => ({
  type: actionTypes.INIT_GROUPS, groups
});

export const initCreateGroup = () => ({
  type: actionTypes.INIT_CREATE_GROUP
});

export const clearChangeGroupData = () => ({
  type: actionTypes.CLEAR_CHANGE_GROUP_DATA
});
