import React, { Component } from "react";

// router
import { withRouter } from "react-router-dom";

// store
import { connect } from "react-redux";

// actions
import {
  requestChangePassword,
  toggleChangePasswordDialog,
  logout,
  triggerSnackbar,
  requestFetchAuthorityMenus,
  requestUpdateNotificationsRead,
  requestFetchMoreNotification,
  openNotifications,
  closeNotifications
} from "../actions";

// material icons
import ActionLabel from "material-ui/svg-icons/action/label";
import ActionVerifiedUser from "material-ui/svg-icons/action/verified-user";
import ActionList from "material-ui/svg-icons/action/list";
import ActionDonutSmall from "material-ui/svg-icons/action/donut-small";
import SocialPerson from "material-ui/svg-icons/social/person";
import SocialGroup from "material-ui/svg-icons/social/group";
import ActionDescription from "material-ui/svg-icons/action/description";
import ActionReoder from "material-ui/svg-icons/action/reorder";

// components
import AccountDialog from "../components/Account/AccountDialog";
import AppMenu from "../components/AppMenu";
import AppNavBar from "../components/AppNavBar";

// etc
import { find, findIndex } from "lodash";

class NavigationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleMenu: {
        open: false
      }
    };
  }

  toggleAppMenu = () => {
    this.setState({
      roleMenu: {
        open: !this.state.roleMenu.open
      }
    });
  };

  handleLogout = () => {
    this.props.logout();
    this.props.history.push("/login");
  };

  render() {
    const baseMenus = [
      {
        name: "home",
        label: "ファイル一覧",
        link: `/home/${this.props.tenant.dirId}`,
        icon: <ActionList />
      },
      {
        name: "tags",
        label: "タグ管理",
        link: `/tags`,
        icon: <ActionLabel />
      },
      {
        name: "analysis",
        label: "容量管理",
        link: `/analysis`,
        icon: <ActionDonutSmall />
      },
      {
        name: "users",
        label: "ユーザ管理",
        link: "/users",
        icon: <SocialPerson />
      },
      {
        name: "groups",
        label: "グループ管理",
        link: "/groups",
        icon: <SocialGroup />
      },
      {
        name: "role_files",
        label: "ロール管理",
        link: "/role_files",
        icon: <ActionVerifiedUser />
      },
      {
        name: "meta_infos",
        label: "メタ情報管理",
        link: "/meta_infos",
        icon: <ActionDescription />
      },
      {
        name: "role_menus",
        label: "メニュー管理",
        link: "/role_menus",
        icon: <ActionReoder />
      }
    ];

    const menus = baseMenus.filter((menu, idx)=>{
      return ( findIndex( this.props.menus ,{ name:menu.name }) >= 0 );
    });

    const appTitle = "cloud storage";

    return (
      <div>
        <AppNavBar
          appTitle={appTitle}
          notifications={this.props.notifications}
          notificationsIsOpen={this.props.notificationsIsOpen}
          unreadNotificationCount={this.props.unreadNotificationCount}
          requestUpdateNotificationsRead={this.props.requestUpdateNotificationsRead}
          requestFetchMoreNotification={this.props.requestFetchMoreNotification}
          openNotifications={this.props.openNotifications}
          closeNotifications={this.props.closeNotifications}
          moreNotificationButton={this.props.moreNotificationButton}
          handleAccountOpen={this.props.toggleChangePasswordDialog}
          handleLogout={this.handleLogout}
          toggleMenu={this.toggleAppMenu}
          tenant={this.props.tenant}
          session={this.props.session}
          appSettings={this.props.appSettings} />

        <AppMenu
          open={this.state.roleMenu.open}
          menus={menus}
          toggle={this.toggleAppMenu}
          />

        <AccountDialog
          changePasswordStore={this.props.changePassword}
          handleClose={this.props.toggleChangePasswordDialog}
          requestChangePassword={this.props.requestChangePassword} />

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notifications: state.notifications.notifications,
    notificationsIsOpen: state.notifications.open,
    unreadNotificationCount: state.notifications.unread,
    moreNotificationButton: (state.notifications.total <= state.notifications.notifications.length),
    changePassword: state.changePassword,
    tenant: state.tenant,
    session: state.session,
    menus: state.navigation.data.menus,
    appSettings: state.appSettings
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  requestChangePassword: (current_password, new_password) => {
    dispatch(requestChangePassword(current_password, new_password));
  },
  toggleChangePasswordDialog: () => { dispatch(toggleChangePasswordDialog()); },
  logout: () => { dispatch(logout()); },
  triggerSnackbar: message => { dispatch(triggerSnackbar(message)); },
  requestFetchAuthorityMenus: () => { dispatch(requestFetchAuthorityMenus()); },
  requestUpdateNotificationsRead: notifications => dispatch(requestUpdateNotificationsRead(notifications)),
  requestFetchMoreNotification: () => dispatch(requestFetchMoreNotification()),
  openNotifications: anchorEl => dispatch(openNotifications(anchorEl)),
  closeNotifications: () => dispatch(closeNotifications())
});

NavigationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationContainer);

export default withRouter(NavigationContainer);
