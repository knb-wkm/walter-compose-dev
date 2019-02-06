import React, { Component } from "react";

// material-uis
import AutoComplete from "material-ui/AutoComplete";
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from "material-ui/MenuItem";
import Dialog from "material-ui/Dialog";

// icons
import SocialPerson from "material-ui/svg-icons/social/person";
import HardwareSecurity from "material-ui/svg-icons/hardware/security";

const style = {
  row: {
    display: "flex",
    width: "100%",
    backgroundColor: "inherit",
    marginLeft: 20
  },

  cell: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    height: 62,
    textAlign: "left",
    fontSize: 16,
    fontFamily: "Roboto sans-serif",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    backgroundColor: "inherit",
    borderBottom: "1px solid lightgray"
  },

  roleListWrapper: {
    marginTop: 20
  }
};

class Authority extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        text: ""
      },
      role: {
        text: ""
      },
      deleteDialog: {
        open: false,
        file: {},
        user: {},
        role: {}
      }
    };
  }

  renderAuthorities = (file) => {
    return file.authorities.map( (auth, idx) => {

      const deletable = auth.users._id === this.props.session.user_id;

      return (
        <div key={idx} style={style.row}>
          <div style={{...style.cell, width: "160px"}}>
            {auth.users.name}
          </div>
          <div style={{...style.cell, width: "160px"}}>
            {auth.role_files.name}
          </div>
          <div style={{...style.cell, width: "120px"}}>
            <RaisedButton
              label="削除"
              disabled={deletable}
              onClick={() => this.setState({
                deleteDialog: {
                  open: true,
                  file: file,
                  user: auth.users,
                  role: auth.role_files
                }
              })}
              />
          </div>
        </div>
      );
    });
  }

  render() {
    const roles = this.props.roles.map( role => {
      return {
        text: role.name,
        role: role,
        value: (
          <MenuItem primaryText={role.name} leftIcon={<HardwareSecurity />}/>
        )
      };
    });

    const users = this.props.users.map( user => {
      return {
        text: user.name,
        user: user,
        value: (
          <MenuItem primaryText={user.name} leftIcon={<SocialPerson />} />
        )
      };
    });

    const deleteDialogActions = [
      (
        <FlatButton
          label="削除"
          primary={true}
          onTouchTap={() => {
            this.props.deleteAuthorityToFile(
              this.state.deleteDialog.file,
              this.state.deleteDialog.user,
              this.state.deleteDialog.role
            );

            this.setState({ deleteDialog: { open: false } });
          }}
          />
      ),
      (
        <FlatButton
          label="閉じる"
          primary={false}
          onTouchTap={() => this.setState({ deleteDialog: { open: false } })}
          />
      )
    ];

    let addClickable = this.state.user.text !== "" && this.state.role.text !== "";

    return (
      <div>
        <div style={{ marginLeft: 20, marginBottom: 40 }}>
          <AutoComplete
            style={{ marginRight: 30 }}
            hintText="ユーザ名またはグループ名を入力"
            searchText={this.state.user.text}
            floatingLabelText="ユーザ名またはグループ名を入力"
            onTouchTap={() => this.setState({ user: { text: "" } }) }
            onNewRequest={(text) => this.setState({ user: text })}
            filter={(text, key) => key.indexOf(text) !== -1 }
            openOnFocus={true}
            menuStyle={{
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
            dataSource={users.filter(u => u.user.enabled )} />

          <AutoComplete
            style={{ marginRight: 30 }}
            hintText="ロールを入力"
            searchText={this.state.role.text}
            floatingLabelText="ロールを入力"
            onTouchTap={() => this.setState({ role: { text: "" } })}
            onNewRequest={(text) => this.setState({ role: text }) }
            filter={(text, key) => key.indexOf(text) !== -1 }
            openOnFocus={true}
            menuStyle={{
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
            dataSource={roles} />

          <RaisedButton
            label="追加"
            primary={addClickable}
            disabled={!addClickable}
            onClick={() => {
              this.props.addAuthorityToFile(
                this.props.file,
                this.state.user.user,
                this.state.role.role
              );
            }} />
        </div>

        <div style={{ marginTop: 20 }}>
          {this.renderAuthorities(this.props.file)}
        </div>

        <Dialog
          title="削除してもよろしいですか"
          open={this.state.deleteDialog.open}
          modal={true}
          actions={deleteDialogActions} >
        </Dialog>

      </div>
    );
  }
}

export default Authority;
