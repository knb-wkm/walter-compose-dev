import React from "react";

import * as constants from "../../constants";

// material
import MenuItem from "material-ui/MenuItem";
import IconMenu from "material-ui/IconMenu";
import IconButton from "material-ui/IconButton";

// icon
import NavigationMenu from "material-ui/svg-icons/navigation/menu";
import ContentForward from "material-ui/svg-icons/content/forward";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
import ContentContentCopy from "material-ui/svg-icons/content/content-copy";
import ActionDelete from "material-ui/svg-icons/action/delete";
import ActionRestore from "material-ui/svg-icons/action/restore";
import ActionVerifiedUser from "material-ui/svg-icons/action/verified-user";


const DirDialogMenu = ({
  dir,
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
      name: constants.PERMISSION_CHANGE_NAME,
      component: idx => (
        <MenuItem
        key={idx}
        primaryText="フォルダ名変更"
        leftIcon={<EditorModeEdit />}
        onTouchTap={() => actions.toggleChangeFileNameDialog(dir) } />
      )
    },
    {
      name: constants.PERMISSION_MOVE,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="移動"
          leftIcon={<ContentForward />}
          onTouchTap={() => (
            actions.toggleMoveDirDialog(dir)
        )} />
      )
    },
    {
      name: constants.PERMISSION_COPY,
      component: idx => (
        <MenuItem
          key={idx}
          primaryText="コピー"
          leftIcon={<ContentContentCopy />}
          onTouchTap={() => actions.toggleCopyDirDialog(dir)}
        />
      )
    },
    {
      name: constants.PERMISSION_DELETE,
      component: idx => (
        <MenuItem
        key={idx}
        primaryText="削除"
        leftIcon={<ActionDelete />}
        onTouchTap={() => actions.toggleDeleteDirDialog(dir)} />
      )
    },
    {
      name: constants.PERMISSION_AUTHORITY,
      component: idx => (
        <MenuItem
        key={idx}
        primaryText="権限を変更"
        leftIcon={<ActionVerifiedUser />}
        onTouchTap={() => actions.toggleAuthorityDirDialog(dir)} />
      )
    }
  ];

  menuItems = trashDirId === dir.dir_id
    ? menuItems.concat(
      {
        name: constants.PERMISSION_RESTORE,
        component: idx => (
          <MenuItem
            key={idx}
            primaryText="ゴミ箱から取り出す"
            leftIcon={<ActionRestore />}
            onTouchTap={() => actions.toggleMoveDirDialog(dir)} />
        )
      }
    ) : menuItems;

  const renderMenu = (menu, dir, idx) => {
    if (dir.actions === undefined) return null;

    return dir.actions.map( act => act.name ).includes(menu.name)
      ? menu.component(idx)
      : null;
  };
  return (
    <IconMenu
      iconButtonElement={action_menu_icon}
      anchorOrigin={{horizontal: "left", vertical: "bottom"}}>

      {menuItems.map( (menu, idx) => renderMenu(menu, dir, idx) )}

    </IconMenu>
  );
};

export default DirDialogMenu;