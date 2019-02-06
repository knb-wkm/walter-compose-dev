import React, { Component } from "react";

import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

// material ui
import { Card, CardTitle, CardText, CardActions } from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";

// components
import NavigationContainer from "./NavigationContainer";
import MetaInfoDetailBasic from "../components/MetaInfo/MetaInfoDetailBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";

import * as actions from "../actions";

class MetaInfoCreateContainer extends Component {
  componentWillMount() {
    this.props.initChangedMetaInfo();
  }

  componentWillUnmount() {
    this.props.initChangedMetaInfo();
    this.props.clearMetaInfoValidationErrors();
  }

  render() {
    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title={<TitleWithGoBack title="メタ情報作成" />}/>
          <CardText>
            <div style={{ display: "flex" }}>
              <Card style={{ width: "35%", marginRight: 20 }}>
                <CardTitle subtitle="基本情報" />
                <CardText>
                  <MetaInfoDetailBasic { ...this.props } displaySaveButton={false} />
                </CardText>
              </Card>
            </div>
          </CardText>
          <CardActions>
            <FlatButton
              label="作成"
              onTouchTap={() => (
                this.props.createMetaInfo(this.props.changedMetaInfo)
              )}
              primary={true} />
            <FlatButton
              label="閉じる"
              onTouchTap={() => this.props.history.push("/meta_infos")} />
          </CardActions>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    changedMetaInfo: state.metaInfo.changedMetaInfo,
    validationErrors: state.metaInfo.validationErrors,
    valueTypes: state.metaInfo.valueTypes
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  initChangedMetaInfo: () => dispatch(actions.initChangedMetaInfo()),
  changeMetaInfoLabel: (label) => dispatch(actions.changeMetaInfoLabel(label)),
  changeMetaInfoName: (name) => dispatch(actions.changeMetaInfoName(name)),
  saveMetaInfoName: (name) => dispatch(actions.saveMetaInfoName(name)),
  saveMetaInfoLabel: (label) => dispatch(actions.saveMetaInfoLabel(label)),
  changeMetaInfoValueType: (value_type) => (
    dispatch(actions.changeMetaInfoValueType(value_type))
  ),
  clearMetaInfoValidationErrors: () => dispatch(actions.clearMetaInfoValidationErrors()) ,
  createMetaInfo: (metaInfo) => (
    dispatch(actions.createMetaInfo(metaInfo, ownProps.history))
  )
});

MetaInfoCreateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MetaInfoCreateContainer);

export default withRouter(MetaInfoCreateContainer);
