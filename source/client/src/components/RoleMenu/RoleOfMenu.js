import React from "react";
import PropTypes from "prop-types";

// material ui
import Chip from "material-ui/Chip";
import AutoComplete from "material-ui/AutoComplete";
import MenuItem from "material-ui/MenuItem";

const RoleOfMenu = ({
  roleMenu,
  menus,
  searchMenu,
  clearSearchMenuText,
  roleMenuActions,
  validationErrors
}) => {

  const renderMenus = (menus) => {
    return menus.map((menu,idx) => {
      return (<Chip
        key={idx}
        style={{ marginRight: 10, marginBottom:10 }}
        onRequestDelete={() => (
          roleMenuActions.deleteRoleOfMenu(roleMenu._id, menu._id)
        )}
      >
        { menu.label }
      </Chip>
      );
    });
  };

  const _menus = menus.filter( menu => {
    return !roleMenu.menus.map(_menu => _menu._id).includes(menu._id);
  }).map( menu =>{
    return {
      _id: menu._id,
      text: menu.label,
      value: <MenuItem primaryText={menu.label} />
    };
  });

  return (
    <div>
      <div style={{display:"flex", flexWrap: "wrap"}}>
        {renderMenus(roleMenu.menus) }
      </div>

      <div>
        <AutoComplete
          hintText="メニューを追加"
          floatingLabelText="メニュー名"
          searchText={searchMenu.text}
          onTouchTap={clearSearchMenuText}
          onNewRequest={(menu) => {
            roleMenuActions.addRoleOfMenu(roleMenu._id, menu._id);
          }}
          openOnFocus={true}
          filter={(text, key) => key.indexOf(text) !== -1}
          dataSource={_menus}
          menuStyle={{
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
          errorText={validationErrors.menu}
        />
      </div>
    </div>
  );
};

RoleOfMenu.propTypes = {
  roleMenus: PropTypes.array.isRequired
};

export default RoleOfMenu;