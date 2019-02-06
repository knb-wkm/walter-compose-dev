import * as actionTypes from "../actionTypes";

export const toggleAddDir = () => ({
  type: actionTypes.TOGGLE_ADD_DIR
});

export const closeSnackbar = () => ({
  type: actionTypes.CLOSE_SNACK
});

export const toggleAddFile = () => ({
  type: actionTypes.TOGGLE_ADD_FILE
});

export const searchFileSimple = (value, history) => ({
  type: actionTypes.SEARCH_FILE_SIMPLE, value, history
});

export const notifications = () => ({
  type: actionTypes.TOGGLE_NOTIFICATIONS
});

export const addTag = (file_id, tag) => ({
  type: actionTypes.ADD_TAG, file_id, tag
});

export const selectDirTree = (dir) => ({
  type: actionTypes.SELECT_DIR_TREE, dir
});

export const requestLogin = (account_name, password) => ({
  type: actionTypes.REQUEST_LOGIN, account_name, password
});

export const requestLoginSuccess = (message, user) => ({
  type: actionTypes.REQUEST_LOGIN_SUCCESS,  message,  user
});

export const requestLoginFailed = (message, errors) => ({
  type: actionTypes.REQUEST_LOGIN_FAILED, message, errors
});

export const putTenant = (tenant_id, name, dirId, trashDirId, trashIconVisibility) => ({
  type: actionTypes.PUT_TENANT, tenant_id, name, dirId, trashDirId, trashIconVisibility
});

export const requestFetchNextFiles = (dir_id, page) => ({
  type: actionTypes.REQUEST_FETCH_NEXT_FILES, dir_id, page
});

export const requestChangePassword = (current_password, new_password) => ({
  type: actionTypes.REQUEST_CHANGE_PASSWORD, current_password, new_password
});

export const loadingStart = () => ({
  type: actionTypes.LOADING_START
});

export const loadingEnd = () => ({
  type: actionTypes.LOADING_END
});

export const toggleChangePasswordDialog = () => ({
  type: actionTypes.TOGGLE_CHANGE_PASSWORD_DIALOG
});

export const logout = () => ({
  type: actionTypes.LOGOUT
});

export const fileUpload = (dir_id, file) => ({
  type: actionTypes.FILE_UPLOAD, dir_id, file
});

export const requestFetchDirTree = (root_id) => ({
  type: actionTypes.REQUEST_FETCH_DIR_TREE, root_id
});

export const requestFetchMetaInfo = (meta_id) => ({
  type: actionTypes.REQUEST_FETCH_META_INFO, meta_id
});

export const initMetaInfo = (meta_info) => ({
  type: actionTypes.INIT_META_INFO, meta_info
});

export const initFile = (file) => ({
  type: actionTypes.INIT_FILE, file
});

export const saveUserPassword = (user) => ({
  type: actionTypes.SAVE_USER_PASSWORD, user
});

export const toggleFileDetailSearchPopover = () => ({
  type: actionTypes.TOGGLE_FILE_DETAIL_SEARCH_POPOVER
});

export const fileDetailSearchAnchorElement = (event) => ({
  type: actionTypes.FILE_DETAIL_SEARCH_ANCHOR_ELEMENT, event
});

export const searchItemPick = (item) => ({
  type: actionTypes.SEARCH_ITEM_PICK, item
});

export const searchItemNotPick = (item) => ({
  type: actionTypes.SEARCH_ITEM_NOT_PICK, item
});

export const searchValueChange = (item, value) => ({
  type: actionTypes.SEARCH_VALUE_CHANGE, item, value
});

export const searchFileDetail = (history) => ({
  type: actionTypes.SEARCH_FILE_DETAIL, history
});

export const requestVerifyToken = (token) => ({
  type: actionTypes.REQUEST_VERIFY_TOKEN, token
});

export const changeMetaInfoName = (name) => ({
  type: actionTypes.CHANGE_META_INFO_NAME, name
});

export const changeMetaInfoLabel = (label) => ({
  type: actionTypes.CHANGE_META_INFO_LABEL, label
});

export const saveMetaInfoName = (changedMetaInfo) => ({
  type: actionTypes.SAVE_METAINFO_NAME, changedMetaInfo
});

export const saveMetaInfoLabel = (changedMetaInfo) => ({
  type: actionTypes.SAVE_METAINFO_LABEL, changedMetaInfo
});

export const saveMetaInfoValidationErrors = (errors) => ({
  type: actionTypes.SAVE_META_INFO_VALIDATION_ERRORS, errors
});

export const clearMetaInfoValidationErrors = () => ({
  type: actionTypes.CLEAR_META_INFO_VALIDATION_ERRORS
});

export const changeMetaInfoValueType = (value_type) => ({
  type: actionTypes.CHANGE_META_INFO_VALUE_TYPE, value_type
});

export const initChangedMetaInfo = () => ({
  type: actionTypes.INIT_CHANGED_META_INFO
});

export const createMetaInfo = (metaInfo, history) => ({
  type: actionTypes.CREATE_META_INFO, metaInfo, history
});

export const triggerSnackbar = (message) => ({
  type: actionTypes.TRIGGER_SNACK, message
});

export const requestFetchAuthorityMenus = () => ({
  type: actionTypes.REQUEST_FETCH_AUTHORITY_MENUS
});

export const initAuthorityMenu = (menus) => ({
  type: actionTypes.INIT_AUTHORITY_MENU, menus
});

export const requestFetchNotification = () => ({
  type: actionTypes.REQUEST_FETCH_NOTIFICATION
});

export const initNotificaiton = (notifications, status) => ({
  type: actionTypes.INIT_NOTIFICAITON, notifications, status
});

export const initMoreNotificaiton = (notifications,status) => ({
  type: actionTypes.INIT_MORE_NOTIFICAITON, notifications, status
});

export const requestUpdateNotificationsRead = (notifications) => ({
  type: actionTypes.REQUEST_UPDATE_NOTIFICATIONS_READ, notifications
});

export const requestFetchMoreNotification = () => ({
  type: actionTypes.REQUEST_FETCH_MORE_NOTIFICATION
});

export const openNotifications = () => ({
  type: actionTypes.OPEN_NOTIFICATIONS
});

export const closeNotifications = () => ({
  type: actionTypes.CLOSE_NOTIFICATIONS
});
