import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material ui
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

// components
import DirTreeContainer from "../../containers/DirTreeContainer";

// actions
import * as FileActions from "../../actions/files";

class MoveDirDialog extends Component {
  render() {
    const actions = [
      (
        <FlatButton
          label="移動"
          onTouchTap={() => {
            const destinationDir = this.props.dirTree.selected;
            const movingDir = this.props.dirTree.move_dir;
            this.props.actions.moveDir(destinationDir, movingDir);
          }}
          primary={true}
          />
      ),
      (
        <FlatButton
          label="閉じる"
          onTouchTap={this.props.actions.toggleMoveDirDialog}
          />
      )
    ];

    return (
      <Dialog
        title="フォルダを移動"
        open={this.props.dirTree.moveDirDialogOpen}
        modal={false}
        autoScrollBodyContent
        onRequestClose={this.props.toggleMoveDirDialog}
        actions={actions} >

        <DirTreeContainer />

      </Dialog>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    dirTree: state.dirTree
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

MoveDirDialog = connect(mapStateToProps, mapDispatchToProps)(MoveDirDialog);

export default MoveDirDialog;
