import * as actionTypes from "../actionTypes";

export const moveFile = (dir, file) => ({
  type: actionTypes.MOVE_FILE, dir, file
});

export const moveFiles = (dir, files) => ({
  type: actionTypes.MOVE_FILES, dir, files
});

export const copyFile = (dir_id, file) => ({
  type: actionTypes.COPY_FILE, dir_id, file
});

export const deleteFile = (file, history) => ({
  type: actionTypes.DELETE_FILE, file, history
});

export const deleteDir = (dir) => ({
  type: actionTypes.DELETE_DIR, dir
});

export const deleteDirTree = (dir) => ({
  type: actionTypes.DELETE_DIR_TREE, dir
});

export const toggleStar = (file) => ({
  type: actionTypes.TOGGLE_STAR, file
});

export const toggleStarSuccessful = (file) => ({
  type: actionTypes.TOGGLE_STAR_SUCCESSFUL, file
});

export const addAuthorityToFile = (file, user, role) => ({
  type: actionTypes.ADD_AUTHORITY_TO_FILE, file, user, role
});

export const deleteAuthorityToFile = (file, user, role) => ({
  type: actionTypes.DELETE_AUTHORITY_TO_FILE, file, user, role
});

export const setSortTarget = (sorted) => ({
  type: actionTypes.SET_SORT_TARGET, sorted
});

export const toggleSortTarget = () => ({
  type: actionTypes.TOGGLE_SORT_TARGET
});

export const sortFile = (dir_id) => ({
  type: actionTypes.SORT_FILE, dir_id
});

export const requestFetchFiles = (
  dir_id, page = 0, sorted = null, desc = null
) => ({
  type: actionTypes.REQUEST_FETCH_FILES, dir_id, page, sorted, desc
});

export const uploadFiles = (dir_id, files, disableFileBuffer = false) => ({
  type: actionTypes.UPLOAD_FILES, dir_id, files, disableFileBuffer
});

export const toggleDeleteFileDialog = (file) => ({
  type: actionTypes.TOGGLE_DELETE_FILE_DIALOG, file
});

export const toggleDeleteFilesDialog = () => ({
  type: actionTypes.TOGGLE_DELETE_FILES_DIALOG
});

export const toggleDownloadFilesDialog = () => ({
  type: actionTypes.TOGGLE_DOWNLOAD_FILES_DIALOG
});

export const toggleMoveDirDialog = (dir) => ({
  type: actionTypes.TOGGLE_MOVE_DIR_DIALOG, dir
});

export const requestFetchMetaInfos = () => ({
  type: actionTypes.REQUEST_FETCH_META_INFOS
});

export const addMetaInfoToFile = (file, metaInfo, value) => ({
  type: actionTypes.ADD_META_INFO_TO_FILE, file, metaInfo, value
});

export const deleteMetaInfoToFile = (file, metaInfo) => ({
  type: actionTypes.DELETE_META_INFO_TO_FILE, file, metaInfo
});

export const toggleFileMetaInfoDialog = (file) => ({
  type: actionTypes.TOGGLE_FILE_META_INFO_DIALOG, file
});

export const toggleFileCheck = (file) => ({
  type: actionTypes.TOGGLE_FILE_CHECK, file
});

export const toggleFileCheckAll = (value) => ({
  type: actionTypes.TOGGLE_FILE_CHECK_ALL, value
});

export const fileNextPage = () => ({
  type: actionTypes.FILE_NEXT_PAGE
});

export const downloadFile = (file) => ({
  type: actionTypes.DOWNLOAD_FILE, file
});

export const downloadFiles = (files) => ({
  type: actionTypes.DOWNLOAD_FILES, files
});

export const requestFetchRoles = () => ({
  type: actionTypes.REQUEST_FETCH_ROLES
});

export const requestFetchUsers = () => ({
  type: actionTypes.REQUEST_FETCH_USERS
});

export const toggleAuthorityFileDialog = (file) => ({
  type: actionTypes.TOGGLE_AUTHORITY_FILE_DIALOG, file
});

export const toggleCopyDirDialog = () => ({
  type: actionTypes.TOGGLE_COPY_DIR_DIALOG
});

export const toggleDeleteDirDialog = (dir) => ({
  type: actionTypes.TOGGLE_DELETE_DIR_DIALOG, dir
});

export const toggleAuthorityDirDialog = (dir) => ({
  type: actionTypes.TOGGLE_AUTHORITY_DIR_DIALOG, dir
});

export const toggleMoveFileDialog = (file) => ({
  type: actionTypes.TOGGLE_MOVE_FILE_DIALOG, file
});

export const toggleCopyFileDialog = (file) => ({
  type: actionTypes.TOGGLE_COPY_FILE_DIALOG, file
});

export const toggleHistoryFileDialog = (file) => ({
  type: actionTypes.TOGGLE_HISTORY_FILE_DIALOG, file
});

export const toggleFileTagDialog = (file) => ({
  type: actionTypes.TOGGLE_FILE_TAG_DIALOG, file
});

export const initFileTag = (file) => ({
  type: actionTypes.INIT_FILE_TAG, file
});

export const triggerSnackbar = (message) => ({
  type: actionTypes.TRIGGER_SNACK, message
});

export const initFileTotal = (total) => ({
  type: actionTypes.INIT_FILE_TOTAL, total
});

export const initFiles = (files) => ({
  type: actionTypes.INIT_FILES, files
});

export const fetchSearchFileSimple = (
  page = 0, sorted = null, desc = null
) => ({
  type: actionTypes.FETCH_SEARCH_FILE_SIMPLE, page, sorted, desc
});

export const searchFileSimple = (value, history) => ({
  type: actionTypes.SEARCH_FILE_SIMPLE, value, history
});

export const initFilePagination = () => ({
  type: actionTypes.INIT_FILE_PAGINATION
});

export const setPageYOffset = ( yOffset ) => ({
  type: actionTypes.SET_PAGE_Y_OFFSET, yOffset
});

export const fetchSearchFileDetail = (page, sorted, desc) => ({
  type: actionTypes.FETCH_SEARCH_FILE_DETAIL, page, sorted, desc
});

export const requestFetchFileSearchItems = (tenant_id) => ({
  type: actionTypes.REQUEST_FETCH_FILE_SEARCH_ITEMS, tenant_id
});

export const requestFetchTags = () => ({
  type: actionTypes.REQUEST_FETCH_TAGS
});

export const initDir = (dirs) => ({
  type: actionTypes.INIT_DIR, dirs
});

export const initNextFiles = (files) => ({
  type: actionTypes.INIT_NEXT_FILES, files
});

export const pushFileToBuffer = (file) => ({
  type: actionTypes.PUSH_FILE_TO_BUFFER, file
});

export const initMetaInfos = (meta_infos) => ({
  type: actionTypes.INIT_META_INFOS, meta_infos
});

export const initFileMetaInfo = (file) => ({
  type: actionTypes.INIT_FILE_META_INFO, file
});

export const updateMetaInfoTarget = (target_file) => ({
  type: actionTypes.UPDATE_META_INFO_TARGET, target_file
});

export const initFileDetailSearchItems = (items) => ({
  type: actionTypes.INIT_FILE_DETAIL_SEARCH_ITEMS, items
});

export const deleteFiles = (files) => ({
  type: actionTypes.DELETE_FILES, files
});

export const toggleMoveFilesDialog = () => ({
  type: actionTypes.TOGGLE_MOVE_FILES_DIALOG
});

export const deleteFileBuffer = (file) => ({
  type: actionTypes.DELETE_FILE_BUFFER, file
});

export const popFileToBuffer = (file) => ({
  type: actionTypes.POP_FILE_TO_BUFFER, file
});

export const initAuthorityFileDialog = (file) => ({
  type: actionTypes.INIT_AUTHORITY_FILE_DIALOG, file
});

export const saveMetaInfoValidationErrors = (errors) => ({
  type: actionTypes.SAVE_META_INFO_VALIDATION_ERRORS, errors
});

export const clearMetaInfoValidationErrors = () => ({
  type: actionTypes.CLEAR_META_INFO_VALIDATION_ERRORS
});

export const clearFilesBuffer = () => ({
  type: actionTypes.CLEAR_FILES_BUFFER
});

export const toggleCreateDir = () => ({
  type: actionTypes.TOGGLE_CREATE_DIR
});

export const createDir = (dir_id, dir_name) => ({
  type: actionTypes.CREATE_DIR, dir_id, dir_name
});

export const requestFetchFile = (file_id, history) => ({
  type: actionTypes.REQUEST_FETCH_FILE, file_id, history
});

export const requestAddTag = (file, tag) => ({
  type: actionTypes.REQUEST_ADD_TAG, file, tag
});

export const requestDelTag = (file, tag) => ({
  type: actionTypes.REQUEST_DEL_TAG, file, tag
});

export const toggleRestoreFileDialog = (file) => ({
  type: actionTypes.TOGGLE_RESTORE_FILE_DIALOG, file
});

export const restoreFile = (file) => ({
  type: actionTypes.RESTORE_FILE, file
});

export const searchItemPick = (item) => ({
  type: actionTypes.SEARCH_ITEM_PICK, item
});

export const searchItemNotPick = (item) => ({
  type: actionTypes.SEARCH_ITEM_NOT_PICK, item
});

export const searchItemNotPickAll = () => ({
  type: actionTypes.SEARCH_ITEM_NOT_PICK_ALL
});

export const toggleFileDetailSearchPopover = () => ({
  type: actionTypes.TOGGLE_FILE_DETAIL_SEARCH_POPOVER
});

export const fileDetailSearchAnchorElement = (event) => ({
  type: actionTypes.FILE_DETAIL_SEARCH_ANCHOR_ELEMENT, event
});

export const searchValueChange = (item, value) => ({
  type: actionTypes.SEARCH_VALUE_CHANGE, item, value
});

export const searchFileDetail = (history, items) => ({
  type: actionTypes.SEARCH_FILE_DETAIL, history, items
});

export const requestFetchFilePreview = (file_id) => ({
  type: actionTypes.REQUEST_FETCH_FILE_PREVIEW, file_id
});

export const initFilePreview = (preview_id) => ({
  type: actionTypes.INIT_FILE_PREVIEW, preview_id
});

export const toggleLoadingFilePreview = () => ({
  type: actionTypes.TOGGLE_LOADING_FILE_PREVIEW
});

export const initFilePreviewBody = (body) => ({
  type: actionTypes.INIT_FILE_PREVIEW_BODY, body
});

export const filePreviewError = (errors) => ({
  type: actionTypes.FILE_PREVIEW_ERROR, errors
});

export const initFile = (file) => ({
  type: actionTypes.INIT_FILE, file
});

export const updateFileRow = (file) => ({
  type: actionTypes.UPDATE_FILE_ROW, file
});

export const insertFileRow = (file) => ({
  type: actionTypes.INSERT_FILE_ROW, file
});

export const deleteFileRows = (delete_file_ids) => ({
  type: actionTypes.DELETE_FILE_ROWS, delete_file_ids
});

export const requestFetchDisplayItems = () => ({
  type: actionTypes.REQUEST_FETCH_DISPLAY_ITEMS
});

export const initDisplayItems = (displayItems) => ({
  type: actionTypes.INIT_DISPLAY_ITEMS, displayItems
});

export const toggleChangeFileNameDialog = (file) => ({
  type: actionTypes.TOGGLE_CHANGE_FILE_NAME_DIALOG, file
});

export const changeFileName = (file, name) => ({
  type: actionTypes.CHANGE_FILE_NAME, file, name
});

export const changeFileNameError = (errors) => ({
  type: actionTypes.CHANGE_FILE_NAME_ERROR, errors
});

export const moveDir = (destinationDir, movingDir) => ({
  type: actionTypes.MOVE_DIR, destinationDir, movingDir
});
export const downloadXlsxFile = ( dir_id, page = 0, sorted = null, desc = null ) => ({
  type: actionTypes.DOWNLOAD_XLSX_FILE, dir_id, page, sorted, desc
});

export const downloadXlsxFileSimple = (value, history) => ({
  type: actionTypes.DOWNLOAD_XLSX_FILE_SIMPLE, value, history
});

export const downloadXlsxFileDetail = (value, history) => ({
  type: actionTypes.DOWNLOAD_XLSX_FILE_DETAIL, value, history
});

export const keepFileSimpleSearchValue = (value) => ({
  type: actionTypes.KEEP_FILE_SIMPLE_SEARCH_VALUE, value
});

export const setFileListType = (list_type) => ({
  type: actionTypes.SET_FILE_LIST_TYPE, list_type
});

export const initFileListType = () => ({
  type: actionTypes.INIT_FILE_LIST_TYPE
});

export const clearFiles = () => ({
  type: actionTypes.CLEAR_FILES
});

export const requestFetchDir = (dir_id) => ({
  type: actionTypes.REQUEST_FETCH_DIR, dir_id
});

export const setDirAction = (dir) => ({
  type:actionTypes.SET_DIR_ACTION, actions: dir.actions
});

export const requestFetchAppSettings = () => ({
  type: actionTypes.REQUEST_FETCH_APP_SETTINGS
});

export const initAppSettings = (settings) => ({
  type: actionTypes.INIT_APP_SETTINGS, settings
});

export const toggleDisplayUnvisibleFiles = (checked) => ({
  type: actionTypes.TOGGLE_DISPLAY_UNVISIBLE_FILES, checked
});

// reduxのデバッグ用(空のイベントをdispatchするだけでredux-loggerがフックされるので)
export const debugReduxLogger = () => ({
  type: actionTypes.DEBUG_REDUX_LOGGER
});

