import React, { Component } from "react";

// material-uis
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

class History extends Component {
  render() {
    const { key, history, file } = this.props;

    return (
      <Card key={key}>
        <CardTitle
          subtitle={history.modified} />
        <CardText>
          <p>{history.user.name}さんが、{history.action}をしました。</p>
        </CardText>
        <CardActions>
          <RaisedButton label="ダウンロード" onTouchTap={() => this.props.actions.downloadFile(file)} />
        </CardActions>
      </Card>
    );
  }
}

export default History;
