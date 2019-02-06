import * as actionTypes from "../actionTypes";

export const requestFetchRoleMenus = () => ({
  type: actionTypes.REQUEST_FETCH_ROLE_MENUS
});

export const initRoleMenus = (roleMenus) => ({
  type: actionTypes.INIT_ROLE_MENUS, roleMenus
});

export const initRoleMenu = (roleMenu) => ({
  type: actionTypes.INIT_ROLE_MENU, roleMenu
});

export const requestFetchRoleMenu = (menu_id) => ({
  type: actionTypes.REQUEST_FETCH_ROLE_MENU, menu_id
});

export const changeRoleMenuName = (name) => ({
  type: actionTypes.CHANGE_ROLE_MENU_NAME, name
});

export const saveRoleMenuName = (roleMenu) => ({
  type: actionTypes.SAVE_ROLE_MENU_NAME, roleMenu
});

export const changeRoleMenuDescription = (description) => ({
  type: actionTypes.CHANGE_ROLE_MENU_DESCRIPTION, description
});

export const saveRoleMenuDescription = (roleMenu) => ({
  type: actionTypes.SAVE_ROLE_MENU_DESCRIPTION, roleMenu
});

export const clearRoleMenuValidationError = () => ({
  type: actionTypes.CLEAR_ROLE_MENU_VALIDATION_ERROR
});

export const saveRoleMenuValidationError = (errors) => ({
  type: actionTypes.SAVE_ROLE_MENU_VALIDATION_ERROR, errors
});

export const requestFetchMenus = () => ({
  type: actionTypes.REQUEST_FETCH_MENUS
});

export const initMenus = (menus) => ({
  type: actionTypes.INIT_MENUS, menus
});

export const addRoleOfMenu = (role_id, menu_id) => ({
  type: actionTypes.ADD_ROLE_OF_MENU, role_id, menu_id
});

export const deleteRoleOfMenu = (role_id, menu_id) => ({
  type: actionTypes.DELETE_ROLE_OF_MENU, role_id, menu_id
});

export const createRoleMenu = (roleMenu, history) => ({
  type: actionTypes.CREATE_ROLE_MENU, roleMenu, history
});

export const deleteRoleMenu = (roleMenu, history) => ({
  type: actionTypes.DELETE_ROLE_MENU, roleMenu, history
});

export const initCreateRoleMenu = () => ({
  type: actionTypes.INIT_CREATE_ROLE_MENU
});
