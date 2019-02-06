import React from "react";

import * as constants from "../../constants";

// material-ui
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import IconButton from "material-ui/IconButton";
import NavigationMenu from "material-ui/svg-icons/navigation/menu";

// icons
import ActionDelete from "material-ui/svg-icons/action/delete";
import ActionDescription from "material-ui/svg-icons/action/description";
import ActionFingerprint from "material-ui/svg-icons/action/fingerprint";
import ActionLabel from "material-ui/svg-icons/action/label";
import ActionHistory from "material-ui/svg-icons/action/history";
import ActionRestore from "material-ui/svg-icons/action/restore";
import ActionVerifiedUser from "material-ui/svg-icons/action/verified-user";
import ContentContentCopy from "material-ui/svg-icons/content/content-copy";
import ContentForward from "material-ui/svg-icons/content/forward";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
import FileFileDownload from "material-ui/svg-icons/file/file-download";

const FileDialogMenu = ({
  file,
  hover,
  trashDirId,
  actions
}) => {
  const opacity = hover ? 1 : 0.1;

  const action_menu_icon = (
    <IconButton style={{ opacity }}>
      <NavigationMenu />
    </IconButton>
  );

  let menuItems = [
    {
      name: constants.PERMISSION_DOWNLOAD,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="ダウンロード"
          leftIcon={<FileFileDownload />}
          onTouchTap={() => actions.downloadFile(file) }
          />
      )
    },
    {
      name: constants.PERMISSION_CHANGE_NAME,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="ファイル名変更"
          leftIcon={<EditorModeEdit />}
          onTouchTap={() => actions.toggleChangeFileNameDialog(file)} />
      )
    },
    {
      name: constants.PERMISSION_MOVE,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="移動"
          leftIcon={<ContentForward />}
          onTouchTap={() => actions.toggleMoveFileDialog(file)} />
      )
    },
    {
      name: constants.PERMISSION_COPY,
      component: idx => (
        <MenuItem
          key={idx}
          onTouchTap={() => actions.toggleCopyFileDialog(file)}
          leftIcon={<ContentContentCopy />}
          primaryText="コピー" />
      )
    },
    {
      name: constants.PERMISSION_DELETE,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="削除"
          leftIcon={<ActionDelete />}
          onTouchTap={() => actions.toggleDeleteFileDialog(file)} />
      )
    },
    {
      name: constants.PERMISSION_AUTHORITY,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="権限を変更"
          leftIcon={<ActionVerifiedUser />}
          onTouchTap={() => actions.toggleAuthorityFileDialog(file)} />
      )
    },
    {
      name: constants.PERMISSION_CHANGE_TAG,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="タグを編集"
          leftIcon={<ActionLabel />}
          onTouchTap={() => actions.toggleFileTagDialog(file)} />
      )
    },
    {
      name: constants.PERMISSION_CHANGE_META_INFO,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="メタ情報を編集"
          leftIcon={<ActionDescription />}
          onTouchTap={() => actions.toggleFileMetaInfoDialog(file)} />
      )
    },
    {
      name: constants.PERMISSION_VIEW_HISTORY,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="履歴を閲覧"
          leftIcon={<ActionHistory />}
          onTouchTap={() => actions.toggleHistoryFileDialog(file)} />
      )
    },
    {
      name: "PERMISSION_TIMESTAMP",
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="タイムスタンプ発行"
          leftIcon={<ActionFingerprint />} />
      )
    }
  ];

  menuItems = trashDirId === file.dir_id
    ? menuItems.concat(
      {
        name: constants.PERMISSION_RESTORE,
        component: idx => (
          <MenuItem
            key={idx}
            primaryText="ゴミ箱から取り出す"
            leftIcon={<ActionRestore />}
            // onTouchTap={() => actions.toggleRestoreFileDialog(file)}
            onTouchTap={() => actions.toggleMoveFileDialog(file)} />
        )
      })
    : menuItems;

  const renderMenu = (menu, file, idx) => {
    if (file.actions === undefined) return null;

    return file.actions.map( act => act.name ).includes(menu.name)
      ? menu.component(idx)
      : null;
  };

  return (
    <IconMenu
      iconButtonElement={action_menu_icon}
      anchorOrigin={{horizontal: "left", vertical: "bottom"}}>

      {menuItems.map( (menu, idx) => renderMenu(menu, file, idx) )}

    </IconMenu>
  );
};

export default FileDialogMenu;
