// ===============================
//  all collection drop
// ===============================
db.files.drop();
db.dirs.drop();
db.tenants.drop();
db.groups.drop();
db.users.drop();
db.tags.drop();
db.meta_infos.drop();
db.display_items.drop();
db.actions.drop();
db.menus.drop();
db.role_files.drop();
db.role_menus.drop();
db.previews.drop();
db.authority_files.drop();
db.authority_menus.drop();
db.notifications.drop();
db.file_meta_infos.drop();
db.download_infos.drop();
db.app_settings.drop();

// ===============================
//  files collection
// ===============================

var files = [
  {
    name: "Top",
    modified: "2017-01-01 10:00",
    is_dir: true,
    dir_id: 0,
    is_display: false,
    authority_files: []
  },
  {
    name: "Trash",
    modified: "2017-01-01 10:00",
    is_dir: true,
    dir_id: 0,
    is_display: false,
    authority_files: []
  }
];

db.files.insert(files);

// ===============================
//  dirs collection
// ===============================

var top_id = db.files.findOne({ name: "Top" }, { _id: 1 })._id;
var trash_id = db.files.findOne({ name: "Trash" }, { _id: 1 })._id;

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
  name: "test",
  home_dir_id: top_id,
  trash_dir_id: trash_id,
  threshold: 1024 * 1024 * 1024 * 100
};
db.tenants.insert(tenant);

// ===============================
// groups collection
// ===============================
var groups = [
  {
    name: "全社",
    description: "全社員が所属するグループ",
    role_files: [],
    tenant_id: db.tenants.findOne({ name: "test" }, { _id: 1 })._id
  },
  {
    name: "管理者",
    description: "システム管理者",
    role_files: [],
    tenant_id: db.tenants.findOne({ name: "test" }, { _id: 1 })._id
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
  groups: [ db.groups.findOne({ name: "全社" }, {_id: 1})._id ],
  tenant_id: db.tenants.findOne({ name: "test" }, { _id: 1 })._id
};

var user2 = {
  type: "user",
  account_name: "taro",
  name: "taro",
  email: "taro",
  password: pass,
  enabled: true,
  groups: [ db.groups.findOne({ name: "全社" }, {_id: 1})._id ],
  tenant_id: db.tenants.findOne({ name: "test" }, { _id: 1 })._id
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
    tenant_id: db.tenants.findOne({ name: "test" }, { _id: 1} )._id
  }
];

db.tags.insert(tags);

// ===============================
//  meta_infos collection
// ===============================

// value_type: ["String", "Number", "Date"]
var tenant = db.tenants.findOne({ name: "test" });

var meta_infos = [
  { tenant_id: tenant._id, label: "受信日時", name: "receive_date_time", value_type: "Date" },
  { tenant_id: tenant._id, label: "送信日時", name: "send_date_time", value_type: "Date" },
  { tenant_id: tenant._id, label: "送信企業名", name: "send_company_name", value_type: "String" },
  { tenant_id: tenant._id, label: "送信ユーザ名", name: "send_user_name", value_type: "String" },
  { tenant_id: tenant._id, label: "受信企業名", name: "receive_company_name", value_type: "String" },
  { tenant_id: tenant._id, label: "受信ユーザ名", name: "receive_user_name", value_type: "String" },
  { tenant_id: tenant._id, label: "表示ファイル名", name: "display_file_name", value_type: "String" }
];

db.meta_infos.insert(meta_infos);

// ===============================
//  display_items collection
// ===============================
var tenant = db.tenants.findOne({ name: "test" });

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
    meta_info_id: db.meta_infos.findOne({ name: "display_file_name" })._id,
    label: "表示ファイル名",
    name: "receive_file_name",
    is_display: true,
    is_excel: true,
    is_search: true,
    width: "50%",
    order: 20
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
    meta_info_id: db.meta_infos.findOne({ name: "send_date_time" })._id,
    label: "送信日時",
    name: "send_date_time",
    is_display: true,
    is_excel: true,
    is_search: true,
    between: true,
    width: "20%",
    default_sort: { desc: true },
    order: 30
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "receive_date_time" })._id,
    label: "受信日時",
    name: "receive_date_time",
    is_display: false,
    is_excel: true,
    is_search: true,
    between: true,
    order: 35
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "send_company_name" })._id,
    label: "送信企業名",
    name: "send_company_name",
    is_display: true,
    is_excel: true,
    is_search: true,
    width: "15%",
    order: 40
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
    order: 50
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "send_user_name" })._id,
    label: "送信ユーザ名",
    name: "send_user_name",
    is_display: false,
    is_excel: true,
    is_search: true,
    order: 70
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "receive_company_name" })._id,
    label: "受信企業名",
    name: "receive_company_name",
    is_display: false,
    is_excel: true,
    is_search: true,
    order: 80
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "receive_user_name" })._id,
    label: "受信ユーザ名",
    name: "receive_user_name",
    is_display: false,
    is_excel: true,
    is_search: true,
    order: 90
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "ファイル名",
    name: "name",
    search_value_type: "String",
    is_display: false,
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
    is_display: false,
    is_excel: false,
    is_search: false,
    between: true,
    width: "20%",
    order: 110
  },
  {
    tenant_id: tenant._id,
    meta_info_id: null,
    label: "メンバー",
    name: "authorities",
    search_value_type: "Select",
    value_type: "Select",
    is_display: false,
    is_excel: true,
    is_search: false,
    width: "15%",
    order: 120
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
  }
];

db.display_items.insert(display_items);

// ===============================
//  actions collection
// ===============================
var actions = [
  {
    name: "list",
    label: "一覧表示"
  },
  {
    name: "detail",
    label: "詳細表示"
  },
  {
    name: "history",
    label: "履歴情報表示"
  },
  {
    name: "download",
    label: "ダウンロード"
  },
  {
    name: "change-name",
    label: "ファイル名変更"
  },
  {
    name: "change-tag",
    label: "タグ変更"
  },
  {
    name: "change-meta-info",
    label: "メタ情報変更"
  },
  {
    name: "upload",
    label: "アップロード"
  },
  {
    name: "makedir",
    label: "フォルダ作成"
  },
  {
    name: "move",
    label: "移動"
  },
  {
    name: "copy",
    label: "複製"
  },
  {
    name: "restore",
    label: "復元"
  },
  {
    name: "delete",
    label: "削除"
  },
  // {
  //   name: "revert",
  //   label: "ゴミ箱から元に戻す"
  // },
  {
    name: "authority",
    label: "権限変更"
  }
];

db.actions.insert(actions);

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
    tenant_id: db.tenants.findOne({ name: "test" })._id
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
      //db.actions.findOne({ name: "revert" })._id
    ],
    tenant_id: db.tenants.findOne({ name: "test" })._id
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
      //db.actions.findOne({ name: "revert" })._id,
      db.actions.findOne({ name: "authority" })._id,
      db.actions.findOne({ name: "move" })._id
    ],
    tenant_id: db.tenants.findOne({ name: "test" })._id
  }
];

db.role_files.insert(role_files);

// ===============================
//  menus collection
// ===============================
var menus = [
  {
    name: "home",
    label: "ファイル一覧"
  },
  {
    name: "tags",
    label: "タグ管理"
  },
  {
    name: "analysis",
    label: "容量管理"
  },
  {
    name: "users",
    label: "ユーザ管理"
  },
  {
    name: "groups",
    label: "グループ管理"
  },
  {
    name: "role_files",
    label: "ロール管理"
  },
  {
    name: "role_menus",
    label: "ユーザタイプ管理"
  },
  {
    name: "meta_infos",
    label: "メタ情報管理"
  },
]

db.menus.insert(menus);

var role_menus = [
  {
    name: "一般ユーザ",
    description: "",
    menus: [
      db.menus.findOne({ name: "home" })._id,
      db.menus.findOne({ name: "tags" })._id,
    ],
    tenant_id: db.tenants.findOne({ name: "test" })._id
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
    tenant_id: db.tenants.findOne({ name: "test" })._id
  },

]

db.role_menus.insert(role_menus);

var authority_menus = [{
  role_menus : db.role_menus.findOne({ name: "一般ユーザ"})._id,
  users : db.users.findOne({ name: "hanako"})._id,
  groups : null
},{
  role_menus : db.role_menus.findOne({ name: "システム管理者"})._id,
  users : db.users.findOne({ name: "taro"})._id,
  groups : null
}]

db.authority_menus.insert(authority_menus);


var preview = {
  image: null
};

db.previews.insert(preview);


var role_file_full_controll = db.role_files.findOne({name:"フルコントロール"});
var role_file_read_only = db.role_files.findOne({name:"読み取りのみ"});
var top_dir = db.files.findOne({name:"Top"});
var trash_dir = db.files.findOne({name:"Trash"});
// var user1 = db.users.findOne(user1); // hanako
var user2 = db.users.findOne(user2);  // taro
var group1 = db.groups.findOne({name:"全社"});

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
var display_file_name_id = db.meta_infos.findOne({name: "display_file_name"})._id;
var send_date_time_id = db.meta_infos.findOne({name: "send_date_time"})._id;
var downloadInfo = {
  type: "file",
  value:`{${display_file_name_id.str}}{${send_date_time_id.str}:YYYYMMDD}{extension}`,
  tenant_id: tenant._id,
  extensionTarget: display_file_name_id
};
db.download_infos.insert(downloadInfo);

// ===============================
//  テナント毎のグローバル設定(app_settings)
// ===============================
var settings = [
  {
    tenant_id: db.tenants.findOne({ name: "test"})._id,
    // ファイル一覧の設定項目
    name: "unvisible_files_toggle",
    description: "非表示属性のファイルを表示/非表示するトグルを表示するか",
    enable: true,
    default_value: false
  },
  {
    tenant_id: db.tenants.findOne({ name: "test" })._id,
    name: "change_user_password_permission",
    description: "ユーザにパスワード変更の権限を許可するか",
    enable: true,
    default_value: false // 許可しない
  }
];

db.app_settings.insert(settings);

// ===============================
//  ユニットテスト用(dirs)
// ===============================

var folder1 = {
  is_star: false,
  is_display: true,
  dir_id: db.files.findOne({ name: "Top" })._id,
  is_dir: true,
  name: "folder1",
  is_crypted: false,
  histories: [
    {
      body: "",
      action: "新規作成",
      user: db.users.findOne({ name: "hanako" })._id,
      modified: "2017-01-01 10:00"
    }
  ],
  tags: [],
  is_deleted: false,
  modified: "2017-01-01 10:00"
};

db.files.insert(folder1);

var folder1_1 = {
  is_star: false,
  is_display: true,
  dir_id: db.files.findOne({ name: "folder1" })._id,
  is_dir: true,
  name: "folder1-1",
  is_crypted: false,
  histories: [
    {
      body: "",
      action: "新規作成",
      user: db.users.findOne({ name: "hanako" })._id,
      modified: "2017-01-01 10:00"
    }
  ],
  tags: [],
  is_deleted: false,
  modified: "2017-01-01 10:00"
};

db.files.insert(folder1_1);

var addDirs = [
  {
    ancestor: db.files.findOne({ name: "folder1" })._id,
    descendant: db.files.findOne({ name: "folder1" })._id,
    depth: 0
  },
  {
    ancestor: db.files.findOne({ name: "folder1-1" })._id,
    descendant: db.files.findOne({ name: "folder1-1" })._id,
    depth: 0
  },
  {
    ancestor: db.files.findOne({ name: "Top" })._id,
    descendant: db.files.findOne({ name: "folder1" })._id,
    depth: 1
  },
  {
    ancestor: db.files.findOne({ name: "Top" })._id,
    descendant: db.files.findOne({ name: "folder1-1" })._id,
    depth: 2
  },
  {
    ancestor: db.files.findOne({ name: "folder1" })._id,
    descendant: db.files.findOne({ name: "folder1-1" })._id,
    depth: 1
  }
];

db.dirs.insert(addDirs);

var addAuthFiles = [
  {
    role_files: db.role_files.findOne({ name: "フルコントロール" })._id,
    users: db.users.findOne({ name: "hanako" })._id,
    files: db.files.findOne({ name: "folder1" })._id
  },
  {
    role_files: db.role_files.findOne({ name: "フルコントロール" })._id,
    users: db.users.findOne({ name: "hanako" })._id,
    files: db.files.findOne({ name: "folder1-1" })._id
  }
];

// ===============================
//  外部キーのindex
// ===============================

db.authority_files.insert(addAuthFiles);

db.files.ensureIndex({ dir_id: 1 });
db.files.ensureIndex({ preview_id: 1 });

db.authority_files.ensureIndex({ files: 1 });
db.authority_files.ensureIndex({ role_files: 1 });
db.authority_files.ensureIndex({ users: 1 });
db.authority_files.ensureIndex({ groups: 1 });

db.authority_menus.ensureIndex({ role_menus: 1 });
db.authority_menus.ensureIndex({ users: 1 });
db.authority_menus.ensureIndex({ groups: 1 });

db.dirs.ensureIndex({ ancestor: 1 });
db.dirs.ensureIndex({ descendant: 1 });

db.display_items.ensureIndex({ tenant_id: 1 });
db.display_items.ensureIndex({ meta_info_id: 1 });

db.file_meta_infos.ensureIndex({ file_id: 1 });
db.file_meta_infos.ensureIndex({ meta_info_id: 1 });

db.groups.ensureIndex({ tenant_id: 1 });

db.meta_infos.ensureIndex({ tenant_id: 1 });

db.notifications.ensureIndex({ users: 1 });

db.role_files.ensureIndex({ tenant_id: 1 });

db.role_menus.ensureIndex({ tenant_id: 1 });

db.tags.ensureIndex({ tenant_id: 1 });

db.tenants.ensureIndex({ home_dir_id: 1 });
db.tenants.ensureIndex({ trash_dir_id: 1 });

db.users.ensureIndex({ tenant_id: 1 });
