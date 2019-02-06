import * as actionTypes from "../actionTypes";

export const requestFetchRoles = () => ({
  type: actionTypes.REQUEST_FETCH_ROLES
});

export const requestFetchActions = () => ({
  type: actionTypes.REQUEST_FETCH_ACTIONS
});

export const requestFetchRole = (role_id) => ({
  type: actionTypes.REQUEST_FETCH_ROLE, role_id
});

export const clearRoleValidationError = () => ({
  type: actionTypes.CLEAR_ROLE_VALIDATION_ERROR
});

export const initRoles = (roles) => ({
  type: actionTypes.INIT_ROLES, roles
});

export const initRole = (role) => ({
  type: actionTypes.INIT_ROLE, role
});

export const changeRoleName = (name) => ({
  type: actionTypes.CHANGE_ROLE_NAME, name
});

export const changeRoleDescription = (description) => ({
  type: actionTypes.CHANGE_ROLE_DESCRIPTION, description
});

export const saveRoleName = (role) => ({
  type: actionTypes.SAVE_ROLE_NAME, role
});

export const saveRoleDescription = (role) => ({
  type: actionTypes.SAVE_ROLE_DESCRIPTION, role
});

export const saveRoleValidationError = (errors) => ({
  type: actionTypes.SAVE_ROLE_VALIDATION_ERROR, errors
});

export const deleteRoleOfAction = (role_id, action_id) => ({
  type: actionTypes.DELETE_ROLE_OF_ACTION, role_id, action_id
});

export const createRole = (role, history) => ({
  type: actionTypes.CREATE_ROLE, role, history
});

export const initCreateRole = () => ({
  type: actionTypes.INIT_CREATE_ROLE
});

export const initActions = (actions) => ({
  type: actionTypes.INIT_ACTIONS, actions
});

export const addRoleOfAction = (role_id, action_id) => ({
  type: actionTypes.ADD_ROLE_OF_ACTION, role_id, action_id
});

export const deleteRole = (role, history) => ({
  type: actionTypes.DELETE_ROLE, role, history
});
