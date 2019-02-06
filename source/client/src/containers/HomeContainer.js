import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material ui
import { Card } from 'material-ui/Card';

// containers
import NavigationContainer from "./NavigationContainer";
import FileActionContainer from "./FileActionContainer";
import FileSearchContainer from "./FileSearchContainer";
import DirBoxContainer from "./DirBoxContainer";
import FileListContainer from "./FileListContainer";

// actions
import * as FileActions from "../actions/files";

class HomeContainer extends Component {

  componentWillMount(){
    this.props.actions.keepFileSimpleSearchValue(undefined);
    this.props.actions.searchItemNotPickAll();

    if (this.props.appSettings.length === 0) {
      this.props.actions.requestFetchAppSettings();
    }
  }

  render() {
    const dirId = this.props.match.params.id;

    return (
      <div>
        <NavigationContainer />

        <Card>
          <div style={{display: "flex"}}>
            <div style={{width: "40%"}}>
              <DirBoxContainer />
            </div>

            <div style={{width: "60%"}}>
              <FileSearchContainer />
            </div>
          </div>

          <div style={{display: "flex"}}>
            <div style={{width: "78%"}}>

              <FileListContainer dir_id={dirId} />

            </div>

            <div style={{width: "22%"}}>
              <FileActionContainer dir_id={dirId} />
            </div>

          </div>
        </Card>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    snackbar: state.snackbar,
    searchWord: state.searchFile,
    fileSortTarget: state.fileSortTarget,
    session: state.session,
    loading: state.loading,
    tenant: state.tenant,
    appSettings: state.appSettings
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

HomeContainer = connect(mapStateToProps, mapDispatchToProps)(HomeContainer);

export default HomeContainer;
