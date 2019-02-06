import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

// material ui
import { Card, CardHeader, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

const Notification = ({ notifications, moreNotificationButton, requestFetchMoreNotification }) => {
  const render = ({ notifications }, idx) => {
    return (
      <Card key={idx} >
        <CardHeader
          title={notifications.title}
          subtitle={moment(notifications.modified).format("YYYY-MM-DD H:m")} />

        <CardText>{notifications.body}</CardText>
      </Card>
    );
  };

  return (
    <div>
      {notifications.map((notification, idx) => render(notification, idx))}
      {
        !moreNotificationButton?(
        <RaisedButton
        label="もっと見る"
        fullWidth={true}
        onClick={() => requestFetchMoreNotification()}
        disabled={moreNotificationButton}
        />
        ):null
      }
    </div>
  );
};

Notification.propTypes = {
  notifications: PropTypes.array.isRequired
};

export default Notification;
