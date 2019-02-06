import React from "react";
import PropTypes from "prop-types";

// material ui
import Chip from "material-ui/Chip";
import AutoComplete from "material-ui/AutoComplete";
import MenuItem from "material-ui/MenuItem";

const RoleOfAction = ({
  role,
  actions,
  searchAction,
  clearSearchActionText,
  roleActions
}) => {
  const renderActions = (actions) => {
    return actions.map( (action, idx) => {
      return (
        <Chip
          key={idx}
          style={{ marginRight: 10, marginBottom: 10 }}
          onRequestDelete={() => (
            roleActions.deleteRoleOfAction(role._id, action._id)
          )} >

          {action.label}
        </Chip>
      );
    });
  };

  const _actions = actions.filter( action => {
    return !role.actions.map(_action => _action._id).includes(action._id);
  }).map( action => {
    return {
      _id: action._id,
      text: action.label,
      value: <MenuItem primaryText={action.label} />
    };
  });

  return (
    <div>
      <div style={{ display: "flex", flexWrap:"wrap" }}>
        {renderActions(role.actions)}
      </div>

      <div>
        <AutoComplete
          hintText="アクションを追加"
          floatingLabelText="アクション名"
          searchText={searchAction.text}
          onTouchTap={clearSearchActionText}
          onNewRequest={(action) => {
            roleActions.addRoleOfAction(role._id, action._id);
          }}
          openOnFocus={true}
          filter={(text, key) => key.indexOf(text) !== -1}
          menuStyle={{
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
          dataSource={_actions}
          />
      </div>
    </div>
  );
};

RoleOfAction.propTypes = {
  actions: PropTypes.array.isRequired
};

export default RoleOfAction;
