import React, { Component } from "react";

// route
import { withRouter } from "react-router-dom";

// store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// material
import {
  Card,
  CardTitle,
  CardText,
  CardActions
} from 'material-ui/Card';

import FlatButton from 'material-ui/FlatButton';

// components
import NavigationContainer from "./NavigationContainer";
import UserDetailBasic from "../components/User/UserDetailBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";

// actions
import * as UserActions from "../actions/users";

class UserCreateContainer extends Component {
  componentWillMount() {
    this.props.actions.initNewUserTemplate();
    this.props.actions.requestFetchRoleMenus();
  }

  componentWillUnmount() {
    this.props.actions.initNewUserTemplate();
  }

  render() {
    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title={<TitleWithGoBack title="ユーザを作成"/>} />
          <CardText>

            <div style={{ display: "flex" }}>
              <div style={{ width: "35%", marginRight: 20 }}>
                <Card>
                  <CardTitle subtitle="基本情報" />
                  <CardText>
                    <UserDetailBasic {...this.props} displaySaveButton={false} />
                  </CardText>
                </Card>
              </div>
            </div>
          </CardText>
          <CardActions>
            <FlatButton
              label="保存"
              onTouchTap={() => {
                this.props.actions.createUser(
                  this.props.user.changed,
                  this.props.history
                );
              }}
              primary={true} />

            <FlatButton
              label="閉じる"
              onTouchTap={() => this.props.history.push("/users")}
              />

          </CardActions>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    tenant: state.tenant,
    roleMenus: state.roleMenus
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(UserActions, dispatch)
});

UserCreateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserCreateContainer);

export default withRouter(UserCreateContainer);
