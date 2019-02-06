import React, { Component } from "react";

// store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// material
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from "material-ui/AutoComplete";
import MenuItem from "material-ui/MenuItem";
import SocialPerson from "material-ui/svg-icons/social/person";
import Chip from 'material-ui/Chip';

import {
  Card,
  CardTitle,
  CardText,
  CardActions
} from 'material-ui/Card';

// components
import NavigationContainer from "./NavigationContainer";
import GroupDetailBasic from "../components/Group/GroupDetailBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";

// actions
import * as GroupActions from "../actions/groups";

class GroupDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        text: ""
      }
    };
  }

  componentWillMount() {
    this.props.actions.requestFetchGroup(this.props.match.params.id);
    this.props.actions.requestFetchUsers(this.props.tenant.tenant_id);
  }

  componentWillUnmount() {
    this.props.actions.clearChangeGroupData();
  }

  renderBelongsToUsers = () => {
    return this.props.group.belongs_to.map( (user, idx) => {
      return (
        <Chip
          key={idx}
          style={{ marginRight: 10, marginBottom: 10 }}
          onRequestDelete={() => {
            this.props.actions.deleteGroupOfUser(user._id, this.props.group._id);
          }} >
          {user.name}
        </Chip>
      );
    });
  };

  render() {
    const users = this.props.users.filter( user => {
      return !this.props.group.belongs_to
        .map( _user => _user._id )
        .includes( user._id );
    }).map( user => {
      const _id = user._id;
      const text = user.name;
      const value = (
        <MenuItem
          primaryText={user.name}
          leftIcon={<SocialPerson />} />
      );

      return { _id, text, value };
    });

    const title = `${this.props.group.name}グループの詳細`;

    return (
      <div>
        <NavigationContainer />

        <Card>
          <CardTitle title={<TitleWithGoBack title={title} />} />
          <CardText>

            <div style={{ display: "flex" }}>
              <Card style={{ width: "35%", marginRight: 20 }}>
                <CardTitle subtitle="基本情報" />
                <CardText>
                  <GroupDetailBasic {...this.props} />
                </CardText>
              </Card>

              <Card style={{ width: "35%"}} >
                <CardTitle subtitle="所属ユーザ" />
                <CardText>
                  <div style={{ display: "flex", flexWrap:"wrap" }}>
                    {this.renderBelongsToUsers()}
                  </div>

                  <AutoComplete
                    floatingLabelText="ユーザ名"
                    searchText={this.state.user.text}
                    onTouchTap={() => this.setState({ user: { text: "" }})}
                    onNewRequest={(user) => {
                      this.props.actions.addGroupOfUser(
                        user._id, this.props.group._id
                      );
                      this.setState({ user: { text: "" }});
                    }}
                    openOnFocus={true}
                    filter={ (text, key) => key.indexOf(text) !== -1 }
                    dataSource={users}
                    menuStyle={{
                      maxHeight: '50vh',
                      overflowY: 'auto',
                    }}
                    />
                </CardText>
              </Card>
            </div>

          </CardText>
          <CardActions>
            <FlatButton
              label="閉じる"
              onTouchTap={() => this.props.history.push("/groups")}
              />
            <FlatButton
              label="削除"
              secondary={true}
              onTouchTap={() => (
                this.props.actions.deleteGroup(
                  this.props.group._id,
                  this.props.history
                )
              )} />
          </CardActions>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    group: state.group.data,
    changedGroup: state.group.changed,
    validationErrors: state.group.errors,
    tenant: state.tenant,
    users: state.users
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(GroupActions, dispatch)
});

GroupDetailContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupDetailContainer);

export default GroupDetailContainer;
