import React, { Component } from "react";

// store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// material
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import FlatButton from "material-ui/FlatButton";

// components
import NavigationContainer from "./NavigationContainer";
import GroupDetailBasic from "../components/Group/GroupDetailBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";

// actions
import * as GroupActions from "../actions/groups";

class GroupCreateContainer extends Component {
  componentWillMount() {
    this.props.actions.initCreateGroup();
  }

  componentWillUnmount() {
    this.props.actions.clearChangeGroupData();
  }

  render() {
    return (
      <div>
        <NavigationContainer />

        <Card>
          <CardTitle title={<TitleWithGoBack title="グループ作成" />} />
          <CardText>

            <div style={{ display: "flex" }}>
              <Card style={{ width: "35%", marginRight: 20 }}>
                <CardTitle subtitle="基本情報" />
                <CardText>
                  <GroupDetailBasic {...this.props} displaySaveButton={false} />
                </CardText>
              </Card>
            </div>

          </CardText>
          <CardActions>
            <FlatButton
              label="保存"
              primary={true}
              onTouchTap={() => (
                this.props.actions.createGroup(
                  this.props.changedGroup,
                  this.props.history
                )
              )}
            />
            <FlatButton
              label="閉じる"
              onTouchTap={() => this.props.history.push("/groups")}
            />
          </CardActions>
        </Card>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    group: state.group.data,
    changedGroup: state.group.changed,
    validationErrors: state.group.errors,
    tenant: state.tenant
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(GroupActions, dispatch)
});

GroupCreateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupCreateContainer);

export default GroupCreateContainer;
