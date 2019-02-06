import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material
import {
  Card,
  CardTitle,
  CardText,
  CardActions
} from 'material-ui/Card';
import FlatButton from "material-ui/FlatButton";

// components
import NavigationContainer from "./NavigationContainer";
import RoleMenuCreateBasic from "../components/RoleMenu/RoleMenuCreateBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";

// actions
import * as roleMenuActions from "../actions/menus";


class RoleMenuCreateContainer extends Component {

  componentWillUnmount() {
    this.props.roleMenuActions.initCreateRoleMenu();
  }

  render() {
    return (
      <div>
        <NavigationContainer />

        <Card>
          <CardTitle title={<TitleWithGoBack title="ロール作成" />} />
          <CardText>
            <div style={{ display: "flex"}} >
              <Card style={{ width: "35%", marginRight: 20 }} >
                <CardTitle subtitle="基本情報" />
                <CardText>
                  <RoleMenuCreateBasic {...this.props} />
                </CardText>
              </Card>
            </div>
          </CardText>

          <CardActions>
            <FlatButton
              label="保存"
              primary={true}
              onTouchTap={() => (
                this.props.roleMenuActions.createRoleMenu(this.props.changedRoleMenu, this.props.history)
              )}
              />

              <FlatButton
                label="閉じる"
                onTouchTap={() => this.props.history.push("/role_menus")}
                />
          </CardActions>

        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    changedRoleMenu: state.roleMenu.changed,
    validationErrors: state.roleMenu.errors
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  roleMenuActions: bindActionCreators(roleMenuActions, dispatch)
});

RoleMenuCreateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RoleMenuCreateContainer);

export default RoleMenuCreateContainer;