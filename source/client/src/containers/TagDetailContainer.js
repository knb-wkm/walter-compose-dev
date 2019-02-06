import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material
import { Card, CardTitle, CardText, CardActions } from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";

// components
import NavigationContainer from "./NavigationContainer";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";
import TagDetailBasic from "../components/Tag/TagDetailBasic";

// actions
import * as TagActions from "../actions/tags";

class TagDetailContainer extends Component {
  componentWillMount() {
    this.props.actions.requestFetchTag(this.props.match.params.id);
  }

  componentWillUnmount() {
    this.props.actions.initTag();
  }

  render() {
    return (
      <div>
      <NavigationContainer />
      <Card>
        <CardTitle title={<TitleWithGoBack title="タグ詳細" />} />
        <CardText>
          <div style={{ display: "flex" }}>
            <Card style={{ width: "35%" }}>
              <CardTitle subtitle="基本情報" />
              <CardText>
                <TagDetailBasic {...this.props} />
              </CardText>
            </Card>
          </div>
        </CardText>
        <CardActions>
          <FlatButton
            label="閉じる"
            primary={true}
            onTouchTap={() => this.props.history.push("/tags")} />
          <FlatButton
            label="削除"
            secondary={true}
            onTouchTap={() => (
              this.props.actions.deleteTag(
                this.props.tag._id,
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
    tag: state.tag.data,
    changedTag: state.tag.changedTag,
    pickerOpen: state.tag.pickerOpen,
    validationErrors: state.tag.validationErrors
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(TagActions, dispatch)
});

TagDetailContainer = connect(mapStateToProps, mapDispatchToProps)(TagDetailContainer);

export default TagDetailContainer;
