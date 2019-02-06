import React from "react";
import PropTypes from "prop-types";

// material
import Toggle from 'material-ui/Toggle';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const UserDetailBasic = ({
  user,
  actions,
  roleMenus,
  displaySaveButton = true
}) => {
  return (
    <div>
      {displaySaveButton ?
        (
          <div>
          <Toggle
            onToggle={() => actions.toggleUser(user.data._id)}
            thumbStyle={{ backgroundColor: "#ffcccc" }}
            trackStyle={{ backgroundColor: "#ff9d9d" }}
            style={{ maxWidth: 200 }}
            label="無効/有効"
            defaultToggled={user.data.enabled}
            />
          </div>
        ) : null}
      <div>
      <TextField
        value={user.changed.account_name}
        onChange={(e, value) => actions.changeUserAccountName(value)}
        errorText={user.errors.account_name}
        floatingLabelText="アカウント名"
      />

      {displaySaveButton ?
       (
         <FlatButton
           label="保存"
           primary={true}
           onClick={() => actions.saveUserAccountName(user.changed)}
           style={{ marginLeft: 10 }}
           />
       ) : null}
      </div>
      <div>
      <TextField
        value={user.changed.name}
        onChange={(e, value) => actions.changeUserName(value)}
        errorText={user.errors.name}
        floatingLabelText="表示名"
      />

      {displaySaveButton ?
       (
         <FlatButton
           label="保存"
           primary={true}
           onClick={() => actions.saveUserName(user.changed)}
           style={{ marginLeft: 10 }}
           />
       ) : null}
      </div>
      <div>
      <TextField
        value={user.changed.email}
        onChange={(e, value) => actions.changeUserEmail(value)}
        errorText={user.errors.email}
        floatingLabelText="メールアドレス"
      />
      {displaySaveButton ?
       (
         <FlatButton
           label="保存"
           primary={true}
           onClick={() => actions.saveUserEmail(user.changed)}
           style={{ marginLeft: 10 }}
           />
       ) : null}
      </div>
      <div>
      <TextField
        value={user.changed.password}
        onChange={(e, value) => actions.changeUserPassword(value)}
        errorText={user.errors.password}
        type="password"
        floatingLabelText="パスワード"
      />

      {displaySaveButton ?
       (
         <FlatButton
           label="保存"
           primary={true}
           onClick={() => actions.saveUserPasswordForce(user.changed)}
           style={{ marginLeft: 10 }} />
       ) : null}
       </div>

       <div>
        <SelectField
        floatingLabelText="ユーザー種類"
        value={user.changed.role_id}
        onChange={(e, idx, value) => actions.changeUserRoleId(value)}
        errorText={user.errors.role_id}
        >
        {roleMenus.data.map( (role, id) => (
          <MenuItem  value={role._id} primaryText={role.name} />
        ))}
        </SelectField>
        {displaySaveButton ?
        (
          <FlatButton
            label="保存"
            primary={true}
            onClick={() => actions.saveUserRoleId(user.changed)}
            style={{ marginLeft: 10, top: -15 }} />
        ) : null}
       </div>

    </div>
  );
};

UserDetailBasic.propTypes = {
  user: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  displaySaveButton: PropTypes.bool
};

export default UserDetailBasic;
