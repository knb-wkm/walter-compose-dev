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
  name: "ms",
  home_dir_id: top_id,
  trash_dir_id: trash_id,
  threshold: 1024 * 1024 * 1024 * 100
};
db.tenants.insert(tenant);

// ===============================
//  users collection
// ===============================

var pass = "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff";

var user1 = {
  type: "user",
  account_name: "user01",
  name: "一般利用者",
  email: "user01",
  password: pass,
  enabled: true,
  tenant_id: db.tenants.findOne({ name: "ms" }, { _id: 1 })._id
};

var user2 = {
  type: "user",
  account_name: "admin01",
  name: "管理者",
  email: "admin01",
  password: pass,
  enabled: true,
  tenant_id: db.tenants.findOne({ name: "ms" }, { _id: 1 })._id
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
    tenant_id: db.tenants.findOne({ name: "ms" }, { _id: 1} )._id
  }
];

db.tags.insert(tags);

// ===============================
//  meta_infos collection
// ===============================

// value_type: ["String", "Number", "Date"]
var tenant = db.tenants.findOne({ name: "ms" });

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
var tenant = db.tenants.findOne({ name: "ms" });

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
    is_search: true,
    order: 25
  },
  {
    tenant_id: tenant._id,
    meta_info_id: db.meta_infos.findOne({ name: "receive_date_time" })._id,
    label: "受信日時",
    name: "receive_date_time",
    is_display: true,
    is_excel: true,
    is_search: true,
    between: true,
    width: "20%",
    order: 30,
    default_sort: { desc: true }
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
    meta_info_id: db.meta_infos.findOne({ name: "send_date_time" })._id,
    label: "送信日時",
    name: "send_date_time",
    is_display: false,
    is_excel: true,
    is_search: true,
    between: true,
    order: 60
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
    is_search: true,
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
    is_search: true,
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
    is_search: true,
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
  {
    name: "revert",
    label: "ゴミ箱から元に戻す"
  },
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
    tenant_id: db.tenants.findOne({ name: "ms" })._id
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
    tenant_id: db.tenants.findOne({ name: "ms" })._id
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
    tenant_id: db.tenants.findOne({ name: "ms" })._id
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
    tenant_id: db.tenants.findOne({ name: "ms" })._id
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
    tenant_id: db.tenants.findOne({ name: "ms" })._id
  },

]

db.role_menus.insert(role_menus);

var authority_menus = [{
  role_menus : db.role_menus.findOne({ name: "一般ユーザ"})._id,
  users : db.users.findOne({ account_name: "user01"})._id,
  groups : null
},{
  role_menus : db.role_menus.findOne({ name: "システム管理者"})._id,
  users : db.users.findOne({ account_name: "admin01"})._id,
  groups : null
}]

db.authority_menus.insert(authority_menus);


var preview = {
  image: null
};

db.previews.insert(preview);


var authority_files = {
  role_files : null,
  users : null,
  groups : null
};

db.authority_files.insert(authority_files);

// ===============================
//  ダウンロードファイルの命名規則
// ===============================
var display_file_name_id = db.meta_infos.findOne({name: "display_file_name"})._id.str;
var send_date_time_id = db.meta_infos.findOne({name: "send_date_time"})._id.str;
var downloadInfo = {
  type: "file",
  value:`{${display_file_name_id}}{${send_date_time_id}:YYYYMMDD}{extension}`,
  tenant_id: tenant._id
};
db.download_infos.insert(downloadInfo);

// ===============================
//  外部キーのindex
// ===============================

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
