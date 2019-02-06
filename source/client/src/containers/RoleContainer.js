import React, { Component } from "react";

// store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// material ui
import { Card, CardTitle, CardText } from 'material-ui/Card';
import { Table, TableBody, TableHeader } from 'material-ui/Table';
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import Divider from "material-ui/Divider";

// material icon
import ActionVerifiedUser from "material-ui/svg-icons/action/verified-user";

// components
import NavigationContainer from "./NavigationContainer";
import RoleTableHeader from "../components/Role/RoleTableHeader";
import RoleTableBody from "../components/Role/RoleTableBody";

// actions
import * as RoleActions from "../actions/roles";

class RoleContainer extends Component {
  componentWillMount() {
    this.props.actions.requestFetchRoles();
  }

  render() {
    const headers = [
      { name: "表示名", width: "25%" },
      { name: "備考", width: "25%" },
      { name: "アクション", width: "40%" },
      { name: "編集", width: "10%" }
    ];

    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title="ロール管理" />
          <CardText>
            <div style={{ display: "flex" }}>

              <div style={{ width: "80%" }}>
                <Table>

                  <TableHeader displaySelectAll={false} adjustForCheckbox={false} >
                    <RoleTableHeader headers={headers} />
                  </TableHeader>
                  <TableBody displayRowCheckbox={false}>
                    {this.props.roles.map( (role, idx) => {
                      return <RoleTableBody role={role} key={idx} headers={headers} />;
                    })}
                  </TableBody>

                </Table>
              </div>

              <div style={{ width: "20%", paddingLeft: 15 }}>
                <Divider />
                <Menu>
                  <MenuItem
                    primaryText="ロール作成"
                    leftIcon={<ActionVerifiedUser />}
                    onTouchTap={() => this.props.history.push("/role_files/create")}
                    />
                </Menu>
              </div>

            </div>
          </CardText>
        </Card>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tenant: state.tenant,
    roles: state.roles.data
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(RoleActions, dispatch)
});

RoleContainer = connect(mapStateToProps, mapDispatchToProps)(RoleContainer);
export default RoleContainer;
