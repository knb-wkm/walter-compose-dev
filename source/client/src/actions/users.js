import * as actionTypes from "../actionTypes";

export const requestFetchUsers = () => ({
  type: actionTypes.REQUEST_FETCH_USERS
});

export const searchUsersSimple = (tenant_id, keyword) => ({
  type: actionTypes.SEARCH_USERS, tenant_id, keyword
});

export const initUsers = (users) => ({
  type: actionTypes.INIT_USERS, users
});

export const createUser = (user, history) => ({
  type: actionTypes.CREATE_USER, user, history
});

export const changeUserValidationError = (errors) => ({
  type: actionTypes.CHANGE_USER_VALIDATION_ERROR, errors
});

export const saveUserName = (user) => ({
  type: actionTypes.SAVE_USER_NAME, user
});

export const clearUserValidationError = () => ({
  type: actionTypes.CLEAR_USER_VALIDATION_ERROR
});

export const initUser = (user) => ({
  type: actionTypes.INIT_USER, user
});

export const saveUserEmail = (user) => ({
  type: actionTypes.SAVE_USER_EMAIL, user
});

export const requestFetchUser = (user_id, tenant_id) => ({
  type: actionTypes.REQUEST_FETCH_USER, user_id, tenant_id
});

export const initGroups = (groups) => ({
  type: actionTypes.INIT_GROUPS, groups
});

export const deleteGroupOfUser = (user_id, group_id) => ({
  type: actionTypes.DELETE_GROUP_OF_USER, user_id, group_id
});

export const initGroup = (group) => ({
  type: actionTypes.INIT_GROUP, group
});

export const addGroupOfUser = (user_id, group_id) => ({
  type: actionTypes.ADD_GROUP_OF_USER, user_id, group_id
});

export const toggleUser = (user_id) => ({
  type: actionTypes.TOGGLE_USER, user_id
});

export const saveUserPasswordForce = (user) => ({
  type: actionTypes.SAVE_USER_PASSWORD_FORCE, user
});

export const saveUserAccountName = (user) => ({
  type: actionTypes.SAVE_USER_ACCOUNT_NAME, user
});

export const initNewUserTemplate = () => ({
  type: actionTypes.INIT_NEW_USER_TEMPLATE
});

export const changeUserPassword = (password) => ({
  type: actionTypes.CHANGE_USER_PASSWORD, password
});

export const changeUserAccountName = (account_name) => ({
  type: actionTypes.CHANGE_USER_ACCOUNT_NAME, account_name
});

export const changeUserName = (name) => ({
  type: actionTypes.CHANGE_USER_NAME, name
});

export const changeUserEmail = (email) => ({
  type: actionTypes.CHANGE_USER_EMAIL, email
});

export const requestFetchRoleMenus = () => ({
  type: actionTypes.REQUEST_FETCH_ROLE_MENUS
});

export const changeUserRoleId = (role_id) => ({
  type: actionTypes.CHANGE_USER_ROLE_ID, role_id
});

export const saveUserRoleId = (user) => ({
  type: actionTypes.SAVE_USER_ROLE_ID, user
});