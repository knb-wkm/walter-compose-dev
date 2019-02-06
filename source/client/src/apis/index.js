import axios from "axios";
import { DEFAULT_API_TIMEOUT, PREVIEW_API_TIMEOUT } from "../constants/index";

export class API {
  constructor() {
    this.client = axios.create({
      headers: {
        "X-Auth-Cloud-Storage": localStorage.getItem("token"),
      },
      timeout: DEFAULT_API_TIMEOUT
    });
  }

  login = (account_name, password, tenant_name) => {
    const data = { account_name, password, tenant_name };

    return axios.post("/api/login", data).then( res => res );
  };

  fetchUserById = (user_id) => {
    this.client.get(`/api/v1/users/${user_id}`);
  };

  fetchFiles = (dir_id, page, sorted, desc, isDisplayUnvisible) => {
    const order = desc ? "desc" : "asc";

    const config = {
      params: { dir_id, page, sort: sorted, order, is_display_unvisible: isDisplayUnvisible }
    };

    return this.client.get("/api/v1/files", config);
  };

  fetchFile = (file_id) => {
    return this.client.get(`/api/v1/files/${file_id}`);
  };

  fetchDirs = (dir_id) => {
    const config = {
      params: {
        dir_id: dir_id
      }
    };

    return this.client.get("/api/v1/dirs", config);
  };

  fetchTags = () => {
    return this.client.get("/api/v1/tags").then(res => res);
  };

  fetchAddTag = (file, tag) => {
    return this.client.post(`/api/v1/files/${file._id}/tags`, tag);
  };

  fetchDelTag = (file, tag) => {
    return this.client.delete(
      `/api/v1/files/${file._id}/tags/${tag._id}`);
  };

  changeFileName = (file, name) => {
    return this.client.patch(`/api/v1/files/${file._id}/rename`, {...file, name});
  };

  editFile = (file) => {
    return this.client.patch(`/api/v1/files/${file._id}/rename`, file);
  };

  changePassword = (user_id, current_password, new_password) => {
    const body = { current_password, new_password };
    return this.client.patch(`/api/v1/users/${user_id}/password`, body);
  };

  createDir = (dir_id, dir_name) => {
    const token = localStorage.getItem("token");
    const body = { dir_id, dir_name, token };

    return this.client.post(`/api/v1/dirs`, body);
  };

  filesUpload = (dir_id, files) => {
    const form = new FormData();

    form.append("dir_id", dir_id);

    files.forEach( file => {
      file.dir_id = dir_id;
      form.append("myFile[]", file);
    });

    return this.client.post(`/api/v1/files`, form);
  };

  moveFileTrash = (file) => {
    return this.client.delete(`/api/v1/files/${file._id}`);
  };

  filesUploadBlob = (dir_id, files) => {
    return this.client.post("/api/v1/files", { dir_id, files });
  };

  deleteFile = (file) => {
    return this.client.delete(`/api/v1/files/${file._id}/delete`);
  };

  moveFile = (dir, file) => {
    const body = { dir_id: dir._id };
    return this.client.patch(`/api/v1/files/${file._id}/move`, body);
  };

  moveDir = (destinationDir, movingDir) => {
    const body = { destinationDir };
    return this.client.patch(`/api/v1/dirs/${movingDir._id}/move`, body);
  };

  searchFiles = (value, page, sorted, desc, isDisplayUnvisible) => {
    const order = desc ? "desc" : "asc";

    const config = {
      params: { q: value, page, sort: sorted, order, is_display_unvisible: isDisplayUnvisible }
    };

    return this.client.get(`/api/v1/files/search`, config);
  };

  fetchDirTree = (root_id) => {
    return this.client.get(`/api/v1/dirs/tree/?root_id=${root_id}`);
  };

  fetchMetaInfos = () => {
    return this.client.get(`/api/v1/meta_infos`);
  };

  fetchMetaInfo = (metainfo_id) => {
    return this.client.get(`/api/v1/meta_infos/${metainfo_id}`);
  };

  addMetaInfoToFile = (file, meta, value) => {
    const body = { meta, value };

    return this.client.post(`/api/v1/files/${file._id}/meta`, body);
  };

  saveMetainfoLabel = (meta) => {
    const body = { label: meta.label };
    return this.client.patch(`/api/v1/meta_infos/${meta._id}/label`, body );
  }

  saveMetainfoName = (meta) => {
    const body = { name: meta.name };
    return this.client.patch(`/api/v1/meta_infos/${meta._id}/name`, body );
  }

  deleteMetaInfoToFile = (file, meta) => {
    return this.client.delete(
      `/api/v1/files/${file._id}/meta/${meta._id}`);
  }

  fetchUsers = () => {
    return this.client.get(`/api/v1/users`);
  };

  fetchUser = (user_id) => {
    return this.client.get(`/api/v1/users/${user_id}`);
  };

  fetchGroup = () => {
    return this.client.get(`/api/v1/groups`);
  };

  deleteGroupOfUser = (user_id, group_id) => {
    return this.client.delete(
      `/api/v1/users/${user_id}/groups/${group_id}`);
  };

  addGroupOfUser = (user_id, group_id) => {
    const body = { group_id };

    return this.client.post(`/api/v1/users/${user_id}/groups`, body);
  };

  toggleUser = (user_id) => {
    return this.client.patch(`/api/v1/users/${user_id}/enabled`);
  };

  saveUserName = (user) => {
    const body = { name: user.name };

    return this.client.patch(`/api/v1/users/${user._id}/name`, body);
  };

  saveUserAccountName = (user) => {
    const body = { account_name: user.account_name };
    return this.client.patch(`/api/v1/users/${user._id}/account_name`, body);
  };

  saveUserEmail = (user) => {
    const body = { email: user.email };

    return this.client.patch(`/api/v1/users/${user._id}/email`, body);
  };

  saveUserPasswordForce = (user) => {
    const body = { password: user.password };

    return this.client.patch(
      `/api/v1/users/${user._id}/password_force`, body);
  };

  saveUserRoleId = (user) => {
    const body = { role_menu_id: user.role_id };
    return this.client.patch(
      `/api/v1/users/${user._id}/role_menus`, body);
  }

  searchUsersSimple = (tenant_id, keyword) => {
    return this.client.get(
      `/api/v1/users/?tenant_id=${tenant_id}&q=${keyword}`);
  };

  fetchGroupById = (group_id) => {
    return this.client.get(`/api/v1/groups/${group_id}`);
  };

  saveGroupName = (group) => {
    const body = { name: group.name };

    return this.client.patch(`/api/v1/groups/${group._id}/name`, body);
  };

  saveGroupDescription = (group) => {
    const body = { description: group.description };

    return this.client.patch(
      `/api/v1/groups/${group._id}/description`, body);
  };

  createUser = (user) => {
    const body = { user };
    body.user.tenant_id = localStorage.getItem("tenantId");
    return this.client.post(`/api/v1/users`, body);
  };

  createGroup = (group) => {
    const body = { group };
    body.group.tenant_id = localStorage.getItem("tenantId");
    return this.client.post(`/api/v1/groups`, body);
  };

  deleteGroup = (group_id) => {
    return this.client.delete(`/api/v1/groups/${group_id}`);
  };

  fetchRoles = () => {
    return this.client.get(`/api/v1/role_files`);
  };

  fetchRole = (role_id) => {
    return this.client.get(`/api/v1/role_files/${role_id}`);
  };

  saveRoleName = (role) => {
    const body = { name: role.name };
    return this.client.patch(`/api/v1/role_files/${role._id}/name`, body);
  };

  saveRoleDescription = (role) => {
    const body = { description: role.description };
    return this.client.patch(
      `/api/v1/role_files/${role._id}/description`, body);
  };

  deleteRoleOfAction = (role_id, action_id) => {
    return this.client.delete(
      `/api/v1/role_files/${role_id}/actions/${action_id}`);
  };

  createRole = (role) => {
    const body = { role, tenant_id: localStorage.getItem("tenantId") };
    return this.client.post(`/api/v1/role_files`, body);
  };

  fetchActions = () => {
    return this.client.get(`/api/v1/actions`);
  };

  addRoleOfAction = (role_id, action_id) => {
    return this.client.patch(
      `/api/v1/role_files/${role_id}/actions/${action_id}`);
  };

  deleteRole = (role) => {
    return this.client.delete(`/api/v1/role_files/${role._id}`);
  };

  fetchFileSearchItems = () => {
    return this.client.get(`/api/v1/files/search_items`);
  };

  searchFilesDetail = (queries, page, sorted, desc, isDisplayUnvisible) => {
    const order = desc ? "desc" : "asc";

    const config = {
      queries, page, sort: sorted, order, is_display_unvisible: isDisplayUnvisible
    };

    return this.client.post("/api/v1/files/search_detail", config);
  };

  fetchTag = (tag_id) => {
    return this.client.get(`/api/v1/tags/${tag_id}`);
  };

  saveTagLabel = (tag) => {
    const body = {
      label: tag.label
    };

    return this.client.patch(`/api/v1/tags/${tag._id}/label`, body);
  };

  saveTagColor = (tag) => {
    const body = {
      color: tag.color
    };

    return this.client.patch(`/api/v1/tags/${tag._id}/color`, body);
  };

  saveTagDescription = (tag) => {
    const body = {
      description: tag.description
    };

    return this.client.patch(`/api/v1/tags/${tag._id}/description`, body);
  };

  createTag = (tag) => {
    const body = { tag };
    return this.client.post("/api/v1/tags", body);
  };

  deleteTag = (tag_id) => {
    return this.client.delete(`/api/v1/tags/${tag_id}`);
  };

  fetchAnalysis = (reported_at) => {
    const params = { reported_at };
    return this.client.get(`/api/v1/analysis`, { params });
  };

  fetchAnalysisPeriod = (start_date, end_date) => {
    const params = { start_date, end_date };
    return this.client.get(`/api/v1/analysis/periods`, { params });
  };

  toggleStar = (file) => {
    return this.client.patch(`/api/v1/files/${file._id}/toggle_star`);
  };

  downloadFile = (file) => {
    const config = {
      responseType: "arraybuffer",
      params: {
        file_id: file._id
      }
    };

    return this.client.get(`/api/v1/files/download`, config);
  };

  addAuthorityToFile = (file, user, role) => {
    const body = { user, role };
    return this.client.post(
      `/api/v1/files/${file._id}/authorities`, body);
  };

  deleteAuthorityToFile = (file, user, role) => {
    const params = { user_id: user._id, role_id: role._id };
    return this.client.delete(`/api/v1/files/${file._id}/authorities`, { params });
  };

  verifyToken = (token) => {
    const body = { token };
    return this.client.post(`/api/login/verify_token`, body);
  };

  searchTagSimple = (keyword) => {
    const config = {
      params: { q: keyword }
    };

    return this.client.get(`/api/v1/tags`, config);
  };

  searchGroupSimple = (keyword) => {
    const config = {
      params: { q: keyword }
    };

    return this.client.get(`/api/v1/groups`, config);
  };

  createMetaInfo = (metainfo) => {
    return this.client.post("/api/v1/meta_infos", { metainfo });
  };

  restoreFile = (file) => {
    return this.client.patch(`/api/v1/files/${file._id}/restore`);
  };

  fetchFilePreview = (file_id) => {
    return this.client.get(`/api/v1/files/${file_id}/preview_exists`,{ timeout : PREVIEW_API_TIMEOUT });
  };

  fetchFilePreviewBody = (preview_id) => {
    return this.client.get(`/api/v1/previews/${preview_id}`);
  };

  fetchRoleMenus = () => {
    return this.client.get(`/api/v1/role_menus`);
  };

  fetchRoleMenu = (menu_id) => {
    return this.client.get(`/api/v1/role_menus/${menu_id}`);
  };

  saveRoleMenuName = (roleMenu) => {
    const body = { name: roleMenu.name };
    return this.client.patch(`/api/v1/role_menus/${roleMenu._id}/name`, body);
  };

  saveRoleMenuDescription = (roleMenu) => {
    const body = { description: roleMenu.description };
    return this.client.patch(`/api/v1/role_menus/${roleMenu._id}/description`, body);
  }

  fetchMenus = () => {
    return this.client.get(`/api/v1/menus`);
  }

  fetchAuthorityMenus = () => {
    return this.client.get(`/api/v1/authority_menus`);
  }

  addRoleOfMenu = (role_id, menu_id) => {
    return this.client.patch(`/api/v1/role_menus/${role_id}/menus/${menu_id}`);
  }

  deleteRoleOfMenu = (role_id, menu_id) => {
    return this.client.delete(
      `/api/v1/role_menus/${role_id}/menus/${menu_id}`);
  };

  createRoleMenu = (roleMenu) => {
    const body = { roleMenu, tenant_id: localStorage.getItem("tenantId") };
    return this.client.post(`/api/v1/role_menus`, body);
  }

  deleteRoleMenu = (roleMenu) => {
    return this.client.delete(`/api/v1/role_menus/${roleMenu._id}`);
  }

  fetchDisplayItems = () => {
    return this.client.get("/api/v1/display_items");
  };

  fetchNotification = (page) => {
    const config = {
      params:{page: (page === undefined ? 0 : page )}
    };
    return this.client.get( `/api/v1/notifications`,config );
  }

  updateNotificationsRead = (notifications) => {
    const readNotificaitons = notifications.map(notification => notification.notifications._id);
    const body = {notifications: readNotificaitons};
    return this.client.patch(`/api/v1/notifications/read`, body);
  }

  downloadXlsxFile = (dir_id, page, sorted, desc, isDisplayUnvisible) => {
    const order = desc ? "desc" : "asc";
    const config = {
      responseType: "arraybuffer",
      params: { dir_id, page, sort: sorted, order, is_display_unvisible: isDisplayUnvisible }
    };

    return this.client.get("/api/v1/excels", config);
  };

  downloadXlsxFileSimple = (value, page, sorted, desc, isDisplayUnvisible) => {
    const order = desc ? "desc" : "asc";

    const config = {
      responseType: "arraybuffer",
      params: { q: value, page, sort: sorted, order, is_display_unvisible: isDisplayUnvisible }
    };

    return this.client.get(`/api/v1/excels/search`, config);
  };

  downloadXlsxFileDetail = (params, page, sorted, desc, isDisplayUnvisible) => {
    const order = desc ? "desc" : "asc";

    const config = {
      responseType: "arraybuffer",
    };
    const data = { ...params, page, sort: sorted, order, is_display_unvisible: isDisplayUnvisible };

    return this.client.post(`/api/v1/excels/search_detail`, data, config);
  };

  downloadInfoFile = () => {
    return this.client.get(`/api/v1/download_info/file`);
  };

  fetchDir = (dir_id) => {
    return this.client.get(`/api/v1/dirs/${dir_id}`);
  };

  fetchAppSettings = () => {
    return this.client.get("/api/v1/app_settings");
  };
}

