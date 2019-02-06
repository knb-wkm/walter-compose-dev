import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// router
import { withRouter } from "react-router-dom";

// lodash
import { intersectionBy, findIndex } from "lodash";

// material
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import FileCloudUpload from "material-ui/svg-icons/file/cloud-upload";
import FileCreateNewFolder from "material-ui/svg-icons/file/create-new-folder";

// material icons
import ActionDelete from "material-ui/svg-icons/action/delete";
import ContentContentCopy from "material-ui/svg-icons/content/content-copy";
import ContentContentCut from "material-ui/svg-icons/content/content-cut";

// components
import AddFileDialog from "../components/AddFileDialog";
import AddDirDialog from "../components/AddDirDialog";
import DeleteAllFilesDialog from "../components/File/DeleteAllFilesDialog";
import DownloadFilesDialog from "../components/File/DownloadFilesDialog";
import FileFileDownload from "material-ui/svg-icons/file/file-download";

import * as FileActions from "../actions/files";
import * as constants from "../constants";
import { find } from "lodash";

class FileActionContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addFile: {
        open: false
      },
      containerYOffset: 0
    };
  }
  componentWillUnmount() {
    window.removeEventListener("scroll",this.onScroll);
  }

  componentDidMount() {
    const fileAction = document.getElementById("fileAction");
    this.state.containerYOffset = fileAction.getBoundingClientRect().top;
    window.addEventListener("scroll", this.onScroll);
  }

  onScroll = (e) => {
    const fileAction = document.getElementById("fileAction");
    if(window.pageYOffset > this.state.containerYOffset){
      fileAction.style.position="fixed";
    }else{
      fileAction.style.position="relative";
    }
  }

  moveFiles = (files) => {
    this.props.actions.moveFiles(this.props.selectedDir, files);
  };

  renderMenuItems = () => {
    // カレントフォルダに依存するmenuなので検索結果では表示することができない
    if (!this.props.isSearch && this.props.checkedFiles.length === 0) {
      const dirActions = [{
        name: constants.PERMISSION_UPLOAD,
        component: idx => (
          <MenuItem
            key={idx}
            primaryText="アップロード"
            leftIcon={<FileCloudUpload />}
            onTouchTap={() => this.setState({ addFile: { open: true } })}
            />
        )},{
          name: constants.PERMISSION_MAKE_DIR,
          component: idx => (
          <MenuItem
            key={idx}
            primaryText="新しいフォルダ"
            leftIcon={<FileCreateNewFolder />}
            onTouchTap={() => this.props.actions.toggleCreateDir() }
            />
        )}
        ,{
          name: constants.PERMISSION_DELETE,
          component: idx => (
          <MenuItem
            key={idx}
            primaryText="ごみ箱"
            leftIcon={<ActionDelete />}
            onTouchTap={() => {
              this.props.history.push(`/home/${this.props.tenant.trashDirId}`);
            }}
            />
        )}
      ];
      const show_trash_icon_by_own_auth = ( find( this.props.appSettings, {name: 'show_trash_icon_by_own_auth', enable: true}) !== undefined)
      return dirActions
          .filter(action => {
            if(action.name === constants.PERMISSION_DELETE && show_trash_icon_by_own_auth ) return this.props.tenant.trashIconVisibility;
            return (find( this.props.dirAction.actions , {"name":action.name}) !== undefined )
          })
          .map((actions,idx) => actions.component());
    }

    const hasDir = (findIndex(this.props.checkedFiles,{"is_dir":true}) >= 0 )

    // フォルダを選択した場合はダウンロードさせない
    let allActions = hasDir ? [] : [{
        name: constants.PERMISSION_DOWNLOAD,
        component: idx => (
          <MenuItem
            key={idx}
            leftIcon={<FileFileDownload />}
            primaryText="ダウンロード"
            onTouchTap={() => this.props.actions.toggleDownloadFilesDialog()}
          />
        )
      }];
      // フォルダ・ファイル共通アクション
      allActions = [
        ...allActions,
      {
        name: constants.PERMISSION_MOVE,
        component: idx => (
          <MenuItem
            key={idx}
            primaryText="移動"
            leftIcon={<ContentContentCut />}
            onTouchTap={() => this.props.actions.toggleMoveFileDialog()} />
        )
      },
      {
        name: constants.PERMISSION_COPY,
        component: idx => (
          <MenuItem
            key={idx}
            leftIcon={<ContentContentCopy />}
            primaryText="コピー" />
        )
      },
      {
        name: constants.PERMISSION_DELETE,
        component: idx => (
          <MenuItem
            key={idx}
            primaryText="削除"
            leftIcon={<ActionDelete />}
            onTouchTap={() => this.props.actions.toggleDeleteFilesDialog()} />
        )
      },
    ];

    // チェックされた単数/複数ファイルのactionsから積集合を算出
    let permitActions = this.props.checkedFiles.map( file => file.actions )
    .reduce( (prev, next, idx) => {
          if (idx === 0) return next;
          return intersectionBy(prev, next, "_id");
        }, []);

    permitActions = intersectionBy(allActions, permitActions, "name");

    return permitActions.map( (action, idx) => action.component(idx) );
  };

  render() {
    return (
      <div style={{marginRight: 30,position:"relative"  , top: 0}} id="fileAction">
        <Menu>
          {this.renderMenuItems()}
        </Menu>

        <AddFileDialog
          dir_id={this.props.match.params.id}
          open={this.state.addFile.open}
          closeDialog={() => this.setState({ addFile: { open: false } })}
          { ...this.props }
          />

          <AddDirDialog
            dir_id={this.props.dir_id}
            { ...this.props }
            />

          <DeleteAllFilesDialog
            open={this.props.deleteFilesDialog.open}
            handleClose={this.props.actions.toggleDeleteFilesDialog}
            deleteFiles={this.props.actions.deleteFiles}
            files={this.props.checkedFiles}
            />

          <DownloadFilesDialog
            open={this.props.downloadFilesDialog.open}
            handleClose={this.props.actions.toggleDownloadFilesDialog}
            downloadFiles={this.props.actions.downloadFiles}
            files={this.props.checkedFiles}
            />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    appSettings: state.appSettings,
    checkedFiles: state.files.filter( file => file.checked ),
    filesBuffer: state.filesBuffer,
    roles: state.roles,
    users: state.users,
    createDirState: state.createDir,
    tenant: state.tenant,
    selectedDir: state.dirTree.selected,
    moveFilesState: state.moveFilesState,
    deleteFilesDialog: state.deleteFiles,
    downloadFilesDialog: state.downloadFiles,
    dirAction: state.dirAction
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

FileActionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FileActionContainer);

export default withRouter(FileActionContainer);
