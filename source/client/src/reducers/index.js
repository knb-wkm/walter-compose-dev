import { combineReducers } from "redux";

// reducers
import files from "./filesReducer";
import dirs from "./dirsReducer";
import snackbar from "./snackbarReducer";
import addDir from "./addDirReducer";
import addFile from "./addFileReducer";
import notifications from "./notificationsReducer";
import filesBuffer from "./filesBufferReducer";
import fileSortTarget from "./fileSortTargetReducer";
import users from "./usersReducer";
import roles from "./rolesReducer";
import selectedDir from "./selectedDirReducer";
import session from "./sessionReducer";
import loading from "./loadingReducer";
import tenant from "./tenantReducer";
import tags from "./tagsReducer";
import changePassword from "./changePasswordReducer";
import createDir from "./createDirReducer";
import fileUpload from "./fileUploadReducer";
import deleteFile from "./deleteFileReducer";
import deleteFiles from "./deleteFilesReducer";
import downloadFiles from "./downloadFilesReducer";
import dirTree from "./dirTreeReducer";
import metaInfo from "./metaInfoReducer";
import user from "./userReducer";
import groups from "./groupsReducer";
import group from "./groupReducer";
import role from "./roleReducer";
import actions from "./actionsReducer";
import fileDetailSearch from "./fileDetailSearchReducer";
import tag from "./tagReducer";
import moveFilesState from "./moveFilesReducer";
import analysis from "./analysisReducer";
import filePagination from "./filePaginationReducer";
import authorityFile from "./authorityFileReducer";
import copyDir from "./copyDirReducer";
import deleteDir from "./deleteDirReducer";
import authorityDir from "./authorityDirReducer";
import moveFile from "./moveFileReducer";
import copyFile from "./copyFileReducer";
import fileHistory from "./fileHistoryReducer";
import fileTag from "./fileTagReducer";
import fileMetaInfo from "./fileMetaInfoReducer";
import restoreFile from "./restoreFileReducer";
import filePreview from "./filePreviewReducer";
import exception from "./exceptionReducer";
import roleMenu from "./roleMenuReducer";
import roleMenus from "./roleMenusReducer";
import menus from "./menusReducer";
import navigation from "./navigationReducer";
import displayItems from "./displayItemsReducer";
import changeFileName from "./changeFileNameReducer";
import fileSimpleSearch from "./fileSimpleSearchReducer";
import fileListType from "./fileListTypeReducer";
import dirAction from "./dirActionReducer";
import appSettings from "./appSettingsReducer";

const fileApp = combineReducers({
  files,
  dirs,
  snackbar,
  addDir,
  addFile,
  filesBuffer,
  fileSortTarget,
  notifications,
  users,
  roles,
  selectedDir,
  session,
  loading,
  tenant,
  tags,
  changePassword,
  createDir,
  fileUpload,
  deleteFile,
  deleteFiles,
  downloadFiles,
  dirTree,
  metaInfo,
  user,
  groups,
  group,
  role,
  actions,
  fileDetailSearch,
  tag,
  moveFilesState,
  analysis,
  filePagination,
  authorityFile,
  copyDir,
  deleteDir,
  authorityDir,
  moveFile,
  copyFile,
  fileHistory,
  fileTag,
  fileMetaInfo,
  restoreFile,
  filePreview,
  exception,
  roleMenu,
  roleMenus,
  menus,
  navigation,
  displayItems,
  changeFileName,
  fileSimpleSearch,
  fileListType,
  dirAction,
  appSettings
});

export default fileApp;
