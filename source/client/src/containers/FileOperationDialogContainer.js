import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// actions
import * as FileActions from "../actions/files";

// components
import MoveDirDialog from "../components/Dir/MoveDirDialog";
import CopyDirDialog from "../components/Dir/CopyDirDialog";
import DeleteDirDialog from "../components/Dir/DeleteDirDialog";
import AuthorityDirDialog from "../components/Dir/AuthorityDirDialog";
import AuthorityFileDialog from "../components/File/AuthorityFileDialog";
import DeleteFileDialog from "../components/File/DeleteFileDialog";
import MoveFileDialog from "../components/File/MoveFileDialog";
import CopyFileDialog from "../components/File/CopyFileDialog";
import HistoryFileDialog from "../components/File/HistoryFileDialog";
import TagFileDialog from "../components/File/TagFileDialog";
import MetaInfoDialog from "../components/File/MetaInfoDialog";
import RestoreFileDialog from "../components/File/RestoreFileDialog";
import ChangeFileNameDialog from "../components/File/ChangeFileNameDialog";

class FileOperationDialogContainer extends Component {
  render() {
    return (
      <div>
        <MoveDirDialog />
        <CopyDirDialog 
          { ...this.props }
          open={this.props.copyDirState.open}
          handleClose={this.props.actions.toggleCopyDirDialog} />
        <DeleteDirDialog
          { ...this.props }
          open={this.props.deleteDirState.open}
          dir={this.props.deleteDirState.dir} />
        <AuthorityDirDialog
          { ...this.props }
          open={this.props.authorityDirState.open}
          roles={this.props.roles}
          users={this.props.users}
          dir={this.props.authorityDirTarget} />
        <AuthorityFileDialog
          { ...this.props }
          open={this.props.authorityFileState.open}
          file={this.props.authorityFileTarget}
          users={this.props.users}
          roles={this.props.roles} />
        <DeleteFileDialog
          { ...this.props }
          open={this.props.deleteFileState.open}
          file={this.props.deleteFileState.file} />
        <MoveFileDialog
          { ...this.props }
          open={this.props.moveFileState.open}
          file={this.props.moveFileState.file}
          dir={this.props.selectedDir} />
        <CopyFileDialog
          { ...this.props }
          open={this.props.copyFileState.open}
          file={this.props.copyFileState.file}
          dir_id={this.props.selectedDir._id} />
        <HistoryFileDialog
          { ...this.props }
          open={this.props.fileHistoryState.open}
          file={this.props.fileHistoryState.file} />
        <TagFileDialog
          { ...this.props }
          open={this.props.fileTagState.open}
          tags={this.props.tags}
          file={this.props.fileTagState.file} />
        <MetaInfoDialog 
          { ...this.props }
          open={this.props.fileMetaInfoState.open}
          file={this.props.metainfoFileTarget}
          metaInfo={this.props.metaInfos} />
        <RestoreFileDialog
          { ...this.props }
          open={this.props.restoreFileState.open}
          file={this.props.restoreFileState.file}
          />
        <ChangeFileNameDialog
          { ...this.props }
          open={this.props.changeFileNameState.open}
          file={this.props.changeFileNameTarget}
          errors={this.props.changeFileNameState.errors}
          />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let authorityFileTarget;

  if (state.authorityFile.file._id !== undefined) {
    authorityFileTarget = state.files.filter( file => (
      file._id === state.authorityFile.file._id
    ))[0];
  } else {
    authorityFileTarget = state.authorityFile.file;
  }

  let authorityDirTarget;

  if (state.authorityDir.dir._id !== undefined) {
    authorityDirTarget = state.files.filter( dir => (
      dir._id === state.authorityDir.dir._id
    ))[0];
  } else {
    authorityDirTarget = state.authorityDir.dir;
  }

  let changeFileNameTarget;

  if (state.changeFileName.file._id !== undefined) {
    changeFileNameTarget = state.files.filter( file => (
      file._id === state.changeFileName.file._id
    ))[0];
  } else {
    changeFileNameTarget = state.changeFileName.file;
  }

  let metainfoFileTarget;

  if (state.fileMetaInfo.file._id !== undefined) {
    metainfoFileTarget = state.files.filter( file => (
      file._id === state.fileMetaInfo.file._id
    ))[0];
  } else {
    metainfoFileTarget = state.fileMetaInfo.file;
  }

  return {
    users: state.users,
    roles: state.roles.data,
    tags: state.tags,
    metaInfos: state.metaInfo.meta_infos,
    copyDirState: state.copyDir,
    deleteFileState: state.deleteFile,
    deleteDirState: state.deleteDir,
    authorityDirState: state.authorityDir,
    authorityFileState: state.authorityFile,
    moveFileState: state.moveFile,
    selectedDir: state.selectedDir,
    copyFileState: state.copyFile,
    fileHistoryState: state.fileHistory,
    fileTagState: state.fileTag,
    fileMetaInfoState: state.fileMetaInfo,
    restoreFileState: state.restoreFile,
    changeFileNameState: state.changeFileName,
    session: state.session,
    authorityFileTarget,
    authorityDirTarget,
    changeFileNameTarget,
    metainfoFileTarget
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

FileOperationDialogContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FileOperationDialogContainer);

export default FileOperationDialogContainer;
