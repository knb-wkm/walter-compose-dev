import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material ui
import { 
  Card, 
  CardTitle, 
  CardText, 
  CardActions
} from 'material-ui/Card';
import FlatButton from "material-ui/FlatButton";

// components
import NavigationContainer from "./NavigationContainer";
import TagCreateBasic from "../components/Tag/TagCreateBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";

// actions
import * as TagActions from "../actions/tags";

class TagCreateContainer extends Component {
  componentWillMount() {
    this.props.actions.initTag();
  }

  componentWillUnmount() {
    this.props.actions.initTag();
  }

  render() {
    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title={<TitleWithGoBack title="タグ作成" />} />
          <CardText>
            <div style={{ display: "flex" }}>
              <Card style={{ width: "35%", marginRight: 20 }}>
                <CardTitle subtitle="基本情報" />
                <CardText>
                  <TagCreateBasic { ...this.props } />
                </CardText>
              </Card>
            </div>
          </CardText>
          <CardActions>
            <FlatButton 
              label="保存"
              primary={true}
              onTouchTap={() => (
                this.props.actions.createTag(
                  this.props.changedTag,
                  this.props.history
                )
              )}
              />

              <FlatButton
                label="閉じる"
                onTouchTap={() => this.props.history.push("/tags")} />

          </CardActions>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    changedTag: state.tag.changedTag,
    validationErrors: state.tag.validationErrors,
    pickerOpen: state.tag.pickerOpen
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(TagActions, dispatch)
});

TagCreateContainer = connect(mapStateToProps, mapDispatchToProps)(TagCreateContainer);

export default TagCreateContainer;
