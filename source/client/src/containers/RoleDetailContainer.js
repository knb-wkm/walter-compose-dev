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
import RoleDetailBasic from "../components/Role/RoleDetailBasic";
import RoleOfAction from "../components/Role/RoleOfAction";

// actions
import * as RoleActions from "../actions/roles";

class RoleDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchAction: {
        text: ""
      }
    };
  }

  componentWillMount() {
    this.props.roleActions.requestFetchRole(this.props.match.params.id);
    this.props.roleActions.requestFetchActions();
    this.props.roleActions.clearRoleValidationError();
  }

  componentWillUnmount() {
    this.props.roleActions.initCreateRole();
  }

  render() {
    const title = `${this.props.role.name}の詳細`;

    return (
      <div>
        <NavigationContainer />

        <Card>
          <CardTitle title={<TitleWithGoBack title={title} />} />
          <CardText>

            <div style={{ display: "flex" }} >
              <div style={{ width: "35%", marginRight: 20 }}>
                <Card>
                  <CardTitle subtitle="基本情報" />
                  <CardText>
                    <RoleDetailBasic { ...this.props } />
                  </CardText>
                </Card>
              </div>

              <div style={{ width: "35%" }}>
                <Card>
                  <CardTitle subtitle="アクション" />
                  <CardText>
                    <RoleOfAction
                      {...this.props}
                      clearSearchActionText={() => {
                        this.setState({ searchAction: { text: "" } });
                      }}
                      searchAction={this.state.searchAction}
                      />
                  </CardText>
                </Card>
              </div>
            </div>

          </CardText>
          <CardActions>
            <FlatButton
              label="閉じる"
              onTouchTap={() => this.props.history.push("/role_files")}
              />
            <FlatButton
              label="削除"
              secondary={true}
              onTouchTap={() => (
                this.props.roleActions.deleteRole(
                  this.props.role,
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

const mapStateToProps = (state, ownProps) => {
  return {
    tenant: state.tenant,
    role: state.role.data,
    changedRole: state.role.changed,
    validationErrors: state.role.errors,
    actions: state.actions
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  roleActions: bindActionCreators(RoleActions, dispatch)
});

RoleDetailContainer = connect(
  mapStateToProps, mapDispatchToProps
)(RoleDetailContainer);

export default RoleDetailContainer;
