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

// actions
import * as MenuActions from "../actions/menus";


// components
import NavigationContainer from "./NavigationContainer";
import RoleMenuTableHeader from "../components/RoleMenu/RoleMenuTableHeader";
import RoleMenuTableBody from "../components/RoleMenu/RoleMenuTableBody";

class RoleMenuContainer extends Component {
  componentWillMount() {
    this.props.actions.requestFetchRoleMenus();
  }

  render() {
    const headers = [
      { name: "表示名", width: "25%" },
      { name: "備考", width: "25%" },
      { name: "メニュー", width: "40%" },
      { name: "編集", width: "10%" }
    ];

    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title="メニュー管理" />
          <CardText>
            <div style={{ display: "flex" }}>
              <div style={{ width:"80%" }}>
                <Table>
                  <TableHeader displaySelectAll={false} adjustForCheckbox={false} >
                    <RoleMenuTableHeader headers={headers} />
                  </TableHeader>
                  <TableBody displayRowCheckbox={false}>
                    { this.props.roleMenus.map( (roleMenu,idx) => {
                      return (
                        <RoleMenuTableBody
                          key={idx}
                          roleMenu={roleMenu}
                          headers={headers} />
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div style={{ width:"20%", paddingLeft: 15 }}>
                <Divider />
                <Menu>
                  <MenuItem
                    primaryText="ロール作成"
                    leftIcon={<ActionVerifiedUser />}
                    onTouchTap={() => this.props.history.push("/role_menus/create")}
                    />
                </Menu>
              </div>


            </div>
          </CardText>
        </Card>
      </div>
    );
  };

}

const mapStateToProps = (state, ownProps) => {
  return {
    tenant: state.tenant,
    roleMenus: state.roleMenus.data
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(MenuActions, dispatch)
});

RoleMenuContainer = connect(mapStateToProps, mapDispatchToProps)(RoleMenuContainer);

export default RoleMenuContainer;
