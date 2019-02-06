import React from "react";
import PropTypes from "prop-types";

// router
import { Link } from "react-router-dom";

// material ui
import ActionAccountCircle from "material-ui/svg-icons/action/account-circle";
import AppBar from "material-ui/AppBar";
import Avatar from "material-ui/Avatar";
import Badge from 'material-ui/Badge';
import Divider from 'material-ui/Divider';
import IconMenu from "material-ui/IconMenu";
import IconButton from 'material-ui/IconButton';
import { List, ListItem } from "material-ui/List";
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import HelpIcon from 'material-ui/svg-icons/action/help';
import Popover from 'material-ui/Popover';

// lodash
import * as _ from "lodash";

// components
import Notification from "../Notification";

const style = {
  textDecoration: "none",
  color: "white"
};

const AppNavBar = ({
  appTitle,
  toggleMenu,
  notifications,
  openNotifications,
  closeNotifications,
  moreNotificationButton,
  requestFetchMoreNotification,
  unreadNotificationCount,
  notificationsIsOpen,
  requestUpdateNotificationsRead,
  handleAccountOpen,
  handleLogout,
  tenant,
  session,
  appSettings
}) => {
  const renderRightElements = () => {
    const notificationIcon = (
      <IconButton
        iconStyle={{ color: "white" }}
        onClick={(e)=>{
          if(notifications.length > 0){
            openNotifications(e.currentTarget);
            requestUpdateNotificationsRead(notifications);
          }
        }}
      >
        <NotificationsIcon />
      </IconButton>
    );

    const accountIcon = (
      <IconButton iconStyle={{ color: "white" }}>
        <ActionAccountCircle />
      </IconButton>
    );

    const avatarIcon = (
      session.user_name === null || session.user_name === undefined
        ? <Avatar />
        : <Avatar size={35}>{session.user_name[0].toUpperCase()}</Avatar>
    );

    // パスワード変更を許可するか
    const changeUserPasswordSetting = _.find(appSettings, { name: "change_user_password_permission" });
    const changeUserPasswordEnable = changeUserPasswordSetting ? changeUserPasswordSetting.value : false;

    return (
      <div style={{paddingRight: 70}}>
        <div id="notificationRoot" style={{display:"inline"}}>
        { unreadNotificationCount > 0 ?(
          <Badge
          badgeContent={unreadNotificationCount}
          style={{padding: 5}}
          secondary={true} >
            {notificationIcon}
          </Badge>
        ):(
          notificationIcon
        )}
        </div>

        <Popover
          open={notificationsIsOpen.open}
          anchorEl={document.getElementById("notificationRoot")}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={()=>{ closeNotifications(); }}
        >
          <div style={{ maxHeight: window.innerHeight * 0.8 }}>
            <Notification notifications={notifications} moreNotificationButton={moreNotificationButton} requestFetchMoreNotification={requestFetchMoreNotification} />
          </div>
        </Popover>

        <IconMenu
          iconButtonElement={accountIcon}
          anchorOrigin={{horizontal: "left", vertical: "bottom"}}>
          <List style={{ padding: 0 }}>
            <ListItem disabled={true} primaryText={session.user_name} rightAvatar={avatarIcon} />
            <Divider />
            { changeUserPasswordEnable
              ? <ListItem  primaryText="パスワード変更" onTouchTap={handleAccountOpen} />
              : null
            }
            <Divider />
            <ListItem  primaryText="ログアウト" onTouchTap={handleLogout} />
          </List>
        </IconMenu>

        <IconButton iconStyle={{ color: "white" }} onClick={() => {
            window.open(`/manuals/${tenant.name}/manual.pdf`, '_blank');
          }} >
          <HelpIcon />
        </IconButton>
      </div>
    );

  };

  const title = (
    <Link to={`/home/${tenant.dirId}`} style={style}>{appTitle}</Link>
  );

  return (
    <AppBar
      title={title}
      iconElementRight={renderRightElements()}
      onLeftIconButtonTouchTap={toggleMenu} />
  );
};

AppNavBar.propTypes = {
  appTitle: PropTypes.string.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  notifications: PropTypes.array.isRequired,
  handleAccountOpen: PropTypes.func.isRequired
};

export default AppNavBar;
