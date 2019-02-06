import React, { Component } from "react";

// store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// material
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import FlatButton from "material-ui/FlatButton";

// components
import NavigationContainer from "./NavigationContainer";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";
import RoleMenuDetailBasic from "../components/RoleMenu/RoleMenuDetailBasic";
import RoleOfMenu from "../components/RoleMenu/RoleOfMenu";

// actions
import * as roleMenuActions from "../actions/menus";

class RoleMenuDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchMenu: {
        text: ""
      }
    };
  }

  componentWillMount() {
    this.props.roleMenuActions.requestFetchRoleMenu(this.props.match.params.id);
    this.props.roleMenuActions.requestFetchMenus();
    this.props.roleMenuActions.clearRoleMenuValidationError();
  }

  componentWillUnmount() {
    this.props.roleMenuActions.initCreateRoleMenu();
  }

  render() {
    const title = `${this.props.roleMenu.name}の詳細`;
    return (
      <div>
        <NavigationContainer />

        <Card>
          <CardTitle title={<TitleWithGoBack title={title} />}/>
          <CardText>

            <div style={{ display: "flex" }}>
              <div style={{ width: "35%", marginRight: 20}}>
                <Card>
                  <CardTitle subtitle="基本情報" />
                  <CardText>
                    <RoleMenuDetailBasic { ...this.props } />
                  </CardText>
                </Card>
              </div>
              <div style={{ width: "35%" }}>
                <Card>
                  <CardTitle subtitle="メニュー"/>
                  <CardText>
                    <RoleOfMenu
                      {...this.props}
                      clearSearchActionText={() => {
                        this.setState({ searchMenu: { text: ""}});
                      }}
                      searchMenu={this.state.searchMenu}
                    />
                  </CardText>
                </Card>
              </div>
            </div>

          </CardText>
          <CardActions>
            <FlatButton
              label="閉じる"
              onTouchTap={() => this.props.history.push("/role_menus")}
              />
            <FlatButton
              label="削除"
              secondary={true}
              onTouchTap={() =>(
                this.props.roleMenuActions.deleteRoleMenu(
                  this.props.roleMenu,
                  this.props.history
                )
              )}
              />
          </CardActions>
        </Card>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) =>{
  return {
    tenant: state.tenant,
    roleMenu: state.roleMenu.data,
    changedMenu: state.roleMenu.changed,
    validationErrors: state.roleMenu.errors,
    menus: state.menus
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  roleMenuActions: bindActionCreators(roleMenuActions,dispatch)
});

RoleMenuDetailContainer = connect(
  mapStateToProps, mapDispatchToProps
)(RoleMenuDetailContainer);

export default RoleMenuDetailContainer;