// [important] テナント名
var tenantName = "test1";

// ===============================
//  files collection
// ===============================

var files = [
  {
    name: "Top",
    modified: "2017-01-01 10:00",
    is_dir: true,
    dir_id: tenantName,
    is_display: false,
    authority_files: []
  },
  {
    name: "Trash",
    modified: "2017-01-01 10:00",
    is_dir: true,
    dir_id: tenantName,
    is_display: false,
    authority_files: []
  }
];

db.files.insert(files);

// ===============================
//  dirs collection
// ===============================

var top_id = db.files.findOne({ name: "Top", dir_id: tenantName }, { _id: 1 })._id;
var trash_id = db.files.findOne({ name: "Trash", dir_id: tenantName }, { _id: 1 })._id;

var dirs = [
  { ancestor: top_id, descendant: top_id, depth: 0 },
  { ancestor: trash_id, descendant: trash_id, depth: 0 },
  { ancestor: top_id, descendant: trash_id, depth: 1 }
];

db.dirs.insert(dirs);

// ===============================
//  tenants collection
// ===============================

// tenants
var tenant = {
  name: tenantName,
  home_dir_id: top_id,
  trash_dir_id: trash_id,
  threshold: 1024 * 1024 * 1024 * 100
};
db.tenants.insert(tenant);
var tenant = db.tenants.findOne({ name: tenantName }, { _id: 1});

// ===============================
// groups collection
// ===============================
var groups = [
  {
    name: "全社",
    description: "全社員が所属するグループ",
    role_files: [],
    tenant_id: tenant._id
  },
  {
    name: "管理者",
    description: "システム管理者",
    role_files: [],
    tenant_id: tenant._id
  }
];

db.groups.insert(groups);

// ===============================
//  users collection
// ===============================

var pass = "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff";

var user1 = {
  type: "user",
  account_name: "hanako",
  name: "hanako",
  email: "test",
  password: pass,
  enabled: true,
  groups: [ db.groups.findOne({ name: "全社", tenant_id: tenant._id }, {_id: 1})._id ],
  tenant_id: tenant._id
};

var user2 = {
  type: "user",
  account_name: "taro",
  name: "taro",
  email: "taro",
  password: pass,
  enabled: true,
  groups: [ db.groups.findOne({ name: "全社", tenant_id: tenant._id }, {_id: 1})._id ],
  tenant_id: tenant._id
};

db.users.insert(user1);
db.users.insert(user2);

// ===============================
//  tags collection
// ===============================

var tags = [
  {
    color: "#f55",
    label: "非表示",
    tenant_id: tenant._id
  }
];

db.tags.insert(tags);

// ===============================
//  meta_infos collection
// ===============================

// value_type: ["String", "Number", "Date"]
// var tenant = db.tenants.findOne({ name: tenantName });

var meta_infos = [
  { tenant_id: tenant._id, label: "メタ情報1", name: "meta_info_1", value_type: "String" },
  { tenant_id: tenant._id, label: "メタ情報2", name: "meta_info_2", value_type: "String" },
  { tenant_id: tenant._id, label: "メタ情報3", name: "meta_info_3", value_type: "String" }
];

db.meta_infos.insert(meta_infos);

// ===============================
//  display_items collection
// ===============================
var display_items = [
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "",
    name: "file_checkbox",
    search_value_type: null,
    is_display: true,
    is_excel: false,
    is_search: false,
    width: "5%",
    order: 10
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "ファイル名",
    name: "name",
    search_value_type: "String",
    is_display: true,
    is_excel: false,
    is_search: true,
    width: "50%",
    order: 100
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "更新日時",
    name: "modified",
    search_value_type: "Date",
    value_type: "Date",
    is_display: true,
    is_excel: false,
    is_search: true,
    between: true,
    width: "20%",
    order: 110,
    default_sort: { desc: true }
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "メンバー",
    name: "authorities",
    search_value_type: null,
    value_type: "Select",
    is_display: true,
    is_excel: true,
    is_search: false,
    width: "15%",
    order: 120
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "操作",
    name: "action",
    search_value_type: null,
    is_display: true,
    is_excel: false,
    is_search: false,
    width: "10%",
    order: 130
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "場所",
    name: "dir_route",
    search_value_type: "String",
    value_type: "String",
    is_display: false,
    is_excel: true,
    is_search: false,
    order: 25
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "お気に入り",
    name: "favorite",
    search_value_type: "Bool",
    value_type: "Bool",
    is_display: false,
    is_excel: false,
    is_search: false,
    order: 130
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "タグ",
    name: "tag",
    search_value_type: "Select",
    value_type: "Select",
    is_display: false,
    is_excel: true,
    is_search: false,
    order: 140
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "meta_info_1", tenant_id: tenant._id })._id,
    label: "メタ情報1",
    name: "meta_info_1",
    is_display: false,
    is_excel: true,
    is_search: true,
    order: 70
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "meta_info_2", tenant_id: tenant._id })._id,
    label: "メタ情報2",
    name: "meta_info_2",
    is_display: false,
    is_excel: true,
    is_search: true,
    order: 71
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "meta_info_3", tenant_id: tenant._id })._id,
    label: "メタ情報3",
    name: "meta_info_3",
    is_display: false,
    is_excel: true,
    is_search: true,
    order: 72
  },
];

db.display_items.insert(display_items);

// ===============================
//  role_files collection
// ===============================

var role_files = [
  {
    name: "読み取りのみ",
    description: "",
    actions: [
      db.actions.findOne({ name: "list" })._id,
      db.actions.findOne({ name: "detail" })._id,
      db.actions.findOne({ name: "history" })._id,
      db.actions.findOne({ name: "download" })._id,
    ],
    tenant_id: tenant._id
  },
  {
    name: "編集可能",
    description: "読み取り + 書き込み",
    actions: [
      db.actions.findOne({ name: "list" })._id,
      db.actions.findOne({ name: "detail" })._id,
      db.actions.findOne({ name: "history" })._id,
      db.actions.findOne({ name: "download" })._id,
      db.actions.findOne({ name: "change-name" })._id,
      db.actions.findOne({ name: "change-tag" })._id,
      db.actions.findOne({ name: "change-meta-info" })._id,
      db.actions.findOne({ name: "upload" })._id,
      db.actions.findOne({ name: "makedir" })._id,
      db.actions.findOne({ name: "copy" })._id,
      db.actions.findOne({ name: "restore" })._id,
      db.actions.findOne({ name: "delete" })._id,
      db.actions.findOne({ name: "revert" })._id
    ],
    tenant_id: tenant._id
  },
  {
    name: "フルコントロール",
    description: "読み取り + 書き込み + 権限変更",
    actions: [
      db.actions.findOne({ name: "list" })._id,
      db.actions.findOne({ name: "detail" })._id,
      db.actions.findOne({ name: "history" })._id,
      db.actions.findOne({ name: "download" })._id,
      db.actions.findOne({ name: "change-name" })._id,
      db.actions.findOne({ name: "change-tag" })._id,
      db.actions.findOne({ name: "change-meta-info" })._id,
      db.actions.findOne({ name: "upload" })._id,
      db.actions.findOne({ name: "makedir" })._id,
      db.actions.findOne({ name: "copy" })._id,
      db.actions.findOne({ name: "restore" })._id,
      db.actions.findOne({ name: "delete" })._id,
      db.actions.findOne({ name: "revert" })._id,
      db.actions.findOne({ name: "authority" })._id,
      db.actions.findOne({ name: "move" })._id
    ],
    tenant_id: tenant._id
  }
];

db.role_files.insert(role_files);

var role_menus = [
  {
    name: "一般ユーザ",
    description: "",
    menus: [
      db.menus.findOne({ name: "home" })._id,
      db.menus.findOne({ name: "tags" })._id,
    ],
    tenant_id: tenant._id
  },
  {
    name: "システム管理者",
    description: "",
    menus: [
      db.menus.findOne({ name: "home" })._id,
      db.menus.findOne({ name: "tags" })._id,
      db.menus.findOne({ name: "analysis" })._id,
      db.menus.findOne({ name: "users" })._id,
      db.menus.findOne({ name: "groups" })._id,
      db.menus.findOne({ name: "role_files" })._id,
      db.menus.findOne({ name: "role_menus" })._id,
      db.menus.findOne({ name: "meta_infos" })._id
    ],
    tenant_id: tenant._id
  },
];

db.role_menus.insert(role_menus);

var authority_menus = [{
  role_menus : db.role_menus.findOne({ name: "一般ユーザ", tenant_id: tenant._id })._id,
  users : db.users.findOne({ name: "hanako", tenant_id: tenant._id })._id,
  groups : null
},{
  role_menus : db.role_menus.findOne({ name: "システム管理者", tenant_id: tenant._id })._id,
  users : db.users.findOne({ name: "taro", tenant_id: tenant._id })._id,
  groups : null
}];

db.authority_menus.insert(authority_menus);

var preview = {
  image: null
};

db.previews.insert(preview);

var role_file_full_controll = db.role_files.findOne({name:"フルコントロール", tenant_id: tenant._id});
var role_file_read_only = db.role_files.findOne({name:"読み取りのみ", tenant_id: tenant._id});
var top_dir = db.files.findOne({ name: "Top", dir_id: tenantName }, { _id: 1 });
var trash_dir = db.files.findOne({ name: "Trash", dir_id: tenantName }, { _id: 1 });
// var user1 = db.users.findOne(user1); // hanako
var user2 = db.users.findOne(user2);  // taro
var group1 = db.groups.findOne({ name:"全社", tenant_id: tenant._id });

var authority_files1 = [{
  files: top_dir._id,
  role_files : role_file_read_only._id,
  users : null,
  groups : group1._id
},{
  files: trash_dir._id,
  role_files : role_file_read_only._id,
  users : null,
  groups : group1._id
}];

var authority_files2 = [{
  files: top_dir._id,
  role_files : role_file_full_controll._id,
  users : user2._id,
  groups : null
},{
  files: trash_dir._id,
  role_files : role_file_full_controll._id,
  users : user2._id,
  groups : null
}];
db.authority_files.insert(authority_files1);
db.authority_files.insert(authority_files2);

// ===============================
//  ダウンロードファイルの命名規則
// ===============================
// var display_file_name_id = db.meta_infos.findOne({name: "display_file_name"})._id;
// var send_date_time_id = db.meta_infos.findOne({name: "send_date_time"})._id;
// var downloadInfo = {
//   type: "file",
//   value:`{${display_file_name_id.str}}{${send_date_time_id.str}:YYYYMMDD}{extension}`,
//   tenant_id: tenant._id,
//   extensionTarget: display_file_name_id
// };
// db.download_infos.insert(downloadInfo);

// ===============================
//  テナント毎のグローバル設定(app_settings)
// ===============================
var settings = [
  {
    tenant_id: tenant._id,
    // ファイル一覧の設定項目
    name: "unvisible_files_toggle",
    description: "非表示属性のファイルを表示/非表示するトグルを表示するか",
    enable: false,
    default_value: false
  },
  {
    tenant_id: tenant._id,
    name: "change_user_password_permission",
    description: "ユーザにパスワード変更の権限を許可するか",
    enable: true,
    default_value: false // 許可しない
  }
];

db.app_settings.insert(settings);
