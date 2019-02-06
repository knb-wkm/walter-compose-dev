import React from "react";
import PropTypes from "prop-types";

// material
import AutoComplete from "material-ui/AutoComplete";
import Chip from 'material-ui/Chip';
import SocialGroup from "material-ui/svg-icons/social/group";
import MenuItem from "material-ui/MenuItem";

const UserBelongsToGroup = ({
  user,
  groups,
  group,
  actions
}) => {
  const renderGroup = (group, idx) => {
    return (
      <Chip
        key={idx}
        style={{ marginRight: 10, marginBottom: 10 }}
        onRequestDelete={() => {
          actions.deleteGroupOfUser(user.data._id, group._id);
        }}
        >

        {group.name}
      </Chip>
    );

  };

  const _groups = groups.filter( group => {
    return !user.data.groups
      .map( g => g._id )
      .includes(group._id);
  }).map( group => {
    const _id = group._id;
    const text = group.name;
    const value = (
      <MenuItem
        primaryText={group.name}
        leftIcon={<SocialGroup />} />
    );

    return { _id, text, value };
  });


  return (
    <div>
      <div style={{ display: "flex", flexWrap:"wrap" }}>
        {user.data.groups.map( (group, idx) => renderGroup(group, idx) )}
      </div>

      <div>
        <AutoComplete
          hintText="所属グループを追加"
          floatingLabelText="グループ名を入力"
          searchText={group.text}
          onTouchTap={actions.clearGroupText}
          onNewRequest={(group) => {
            actions.addGroupOfUser(user.data._id, group._id);
          }}
          openOnFocus={true}
          filter={(text, key) => key.indexOf(text) !== -1}
          dataSource={_groups}
          menuStyle={{
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        />
      </div>
    </div>
  );
};

UserBelongsToGroup.propTypes = {
  user: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
  groups: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

export default UserBelongsToGroup;
