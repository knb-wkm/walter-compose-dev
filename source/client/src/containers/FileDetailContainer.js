import React, { Component } from "react";
import moment from "moment";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// containers
import NavigationContainer from "./NavigationContainer";

// material
import {
  Card,
  CardHeader,
  CardTitle,
  CardText,
  CardMedia,
  CardActions
} from 'material-ui/Card';
import RaisedButton from "material-ui/RaisedButton";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import CircularProgress from 'material-ui/CircularProgress';

// components
import Authority from "../components/Authority";
import History from "../components/History";
import Tag from "../components/Tag";
import MetaInfo from "../components/MetaInfo";
import FileBasic from "../components/FileBasic";
import TitleWithGoBack from "../components/Common/TitleWithGoBack";
import ChangeFileNameDialog from "../components/File/ChangeFileNameDialog";
import DeleteFileDialog from "../components/File/DeleteFileDialog";
import MoveFileDialog from "../components/File/MoveFileDialog";

// actions
import * as FileActions from "../actions/files";

import { FILE_DETAIL } from "../constants";

import { find, findIndex, uniq, chain, value } from "lodash";

const styles = {
  fileImageWrapper: {
    display: "flex"
  },
  innerCard: {
    marginTop: 10,
    marginLeft: 15,
    marginRight: 15
  },
  metaRow: {
    marginTop: 10,
    display: "flex"
  },
  metaCell: {
    marginRight: 20,
    width: "20%"
  },
  circular: {
    position: "absolute",
    paddingTop: "30%",
    width: "100%",
    height: "100%",
    backgroundColor: "#ddd",
    opacity: 0.5,
    textAlign: "center"
  }
};

class FileDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editAuthority: {
        open: false
      },
      editTag: {
        value: ""
      }
    };
  }

  componentDidMount() {
    this.props.actions.requestFetchFile(this.props.match.params.id, this.props.history);
    this.props.actions.requestFetchTags();
    this.props.actions.requestFetchMetaInfos(this.props.tenant.tenant_id);
    this.props.actions.requestFetchFilePreview(this.props.match.params.id);
    this.props.actions.requestFetchRoles();
    this.props.actions.requestFetchUsers();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.props.actions.requestFetchFile(nextProps.match.params.id);
      this.props.actions.requestFetchTags();
      this.props.actions.requestFetchMetaInfos(this.props.tenant.tenant_id);
    }
  }

  renderBasic = () => {
    const editable = this.props.file.actions.filter( act => (
      act.name === "change-name"
    )).length > 0;

    const editButton = editable
          ? (
            <RaisedButton
              onTouchTap={() => {
                this.props.actions.toggleChangeFileNameDialog(this.props.file);
              }}
              label="編集" />
          ) : null;

    return (
      <Card style={styles.innerCard}>
        <CardHeader title="基本情報" />
        <CardText>
          <FileBasic file={this.props.file} />
        </CardText>
        <CardActions>
          {editButton}
        </CardActions>
      </Card>
    );
  };

  renderAuthorities = () => {
    const renderAuthority = (auth, idx) => {
      return (
        <div key={idx} style={styles.metaRow}>
          <div style={{...styles.metaCell, width: "30%"}}>
            {auth.users.name}
          </div>
          <div>{auth.role_files.name}</div>
        </div>
      );
    };

    const editable = this.props.file.actions.filter( act => (
      act.name === "authority"
    )).length > 0;

    const button = editable
          ? (
            <RaisedButton
              onTouchTap={() => this.setState({ editAuthority: { open: true } })}
              label="編集"
              />
          ) : null;

    return (
      <Card style={styles.innerCard}>
        <CardHeader title="メンバー" />
        <CardText>
          {this.props.file.authorities.map( (auth, idx) => (
            renderAuthority(auth, idx)
          ))}
        </CardText>
        <CardActions>{button}</CardActions>
      </Card>
    );
  };

  renderHistories = () => {
    const permitDisplay = this.props.file.actions.filter( act => (
      act.name === "history"
    )).length > 0;

    if (permitDisplay) {
      return (
        <Card style={styles.innerCard}>
          <CardHeader title="履歴情報" />
          <CardText>
            {this.props.file.histories.map( (history, idx) => {
              return (
                <History
                  { ...this.props }
                  key={idx}
                  file={this.props.file}
                  history={history}
                  />
              );
            })}
          </CardText>
        </Card>
      );
    }
    else {
      return null;
    }
  };

  renderDownload = () => {
    const style = {
      marginTop: 8
    }
    const renderButtons = [{
      name: "download",
      component: () => (<RaisedButton label="ダウンロード" onClick={() => this.props.actions.downloadFile(this.props.file)} style={style} />)
    },
    // // 2018-02-01 ファイルではなく一覧が持つべきアクションなのでコメントアウト
    // {
    //   name: "move",
    //   component: () => (<RaisedButton label="移動" onClick={() => {
    //     this.props.actions.toggleMoveFileDialog(this.props.file);
    //   }

    //   } style={style}  />)
    // },
    {
      name: "delete",
      component: () => (<RaisedButton label="削除" onClick={() => this.props.actions.toggleDeleteFileDialog(this.props.file)} style={style} />)
    }]

    const permitDisplay = chain(this.props.file.actions).filter( act => (
        (findIndex( renderButtons , { name: act.name})) >= 0
      )).map(act => act.name )
      .uniq()
      .map(name => ((find( renderButtons , { name: name}))
      .component()))
      .value();

    if (permitDisplay.length > 0) {
      return (
        <Card style={styles.innerCard}>
          <CardHeader title="操作 " />
          <CardActions>
            {permitDisplay}
          </CardActions>
        </Card>
      );
    }
    else {
      return null;
    }
  };

  renderAuthorityDialog = () => {
    const editAuthorityActions = (
      <FlatButton
        label="閉じる"
        primary={true}
        onTouchTap={() => this.setState({ editAuthority: { open: false } })}
        />
    );

    return (
      <Dialog
        title="権限を変更"
        modal={false}
        actions={editAuthorityActions}
        open={this.state.editAuthority.open}
        onRequestClose={() => this.setState({ editAuthority: { open: false } })} >

        <Authority
          file={this.props.file}
          users={this.props.users}
          roles={this.props.roles}
          session={this.props.session}
          addAuthority={this.props.addAuthority}
          addAuthorityToFile={this.props.actions.addAuthorityToFile}
          deleteAuthorityToFile={this.props.actions.deleteAuthorityToFile}
          triggerSnackbar={this.props.actions.triggerSnackbar} />

      </Dialog>
    );

  };

  renderMetaInfos = () => {
    const render = (meta, idx) => {
      const value = meta.value_type === "Date"
            ? moment(meta.value).format("YYYY-MM-DD HH:mm")
            : meta.value;

      return (
        <div key={idx} style={styles.metaRow}>
          <div style={{ ...styles.metaCell, width: "30%" }}>
            {meta.label}
          </div>
          <div style={{ ...styles.metaCell, width: "70%", wordWrap: "break-word" }}>
            {value}
          </div>
        </div>
      );
    };

    const editable = this.props.file.actions.filter( act => (
      act.name === "change-meta-info"
    )).length > 0;

    const button = editable
          ? (
            <RaisedButton
              label="編集"
              onTouchTap={() => (
                this.props.actions.toggleFileMetaInfoDialog(this.props.file)
              )}
              />
          ) : null;

    return (
      <Card style={styles.innerCard}>
        <CardHeader title="メタ情報" />
        <CardText>
          {this.props.file.meta_infos.map( (meta, idx) => render(meta, idx) )}
        </CardText>
        <CardActions>{button}</CardActions>
      </Card>
    );
  };

  renderMetaInfoDialog = () => {
    const actions = (
      <FlatButton
        label="閉じる"
        primary={true}
        onTouchTap={this.props.actions.toggleFileMetaInfoDialog}
        />
    );

    return (
      <Dialog
        title="メタ情報を編集"
        actions={actions}
        modal={false}
        open={this.props.fileMetaInfo.open}
        autoScrollBodyContent={true}
        onRequestClose={this.props.actions.toggleFileMetaInfoDialog} >

        <MetaInfo
          file={this.props.file}
          metaInfo={this.props.metaInfo.meta_infos}
          addMetaInfoToFile={this.props.actions.addMetaInfoToFile}
          deleteMetaInfoToFile={this.props.actions.deleteMetaInfoToFile}
          triggerSnackbar={this.props.actions.triggerSnackbar} />

      </Dialog>
    );
  };

  render() {
    if (this.props.file === undefined || this.props.file._id === undefined) {
      return null;
    }

    let previewImg;

    if (this.props.filePreviewState.loading) {
      previewImg = (
        <div>
          <CircularProgress
            size={100} thickness={7} style={styles.circular} />
          <img src="/images/loading.png" alt="loading..." />
        </div>
      );
    }
    else if (this.props.filePreviewState.errors) {
      previewImg = (
        <img src="/images/preview_error.png" alt="filepreview error" />
      );
    }
    else {
      previewImg = (
        <img
          src={`data:image/png;base64,${this.props.filePreviewState.body}`}
          alt="filepreview" />
      );
    }

    return (
      <div>
        <NavigationContainer />

        <Card style={{paddingBottom: 10}}>
          <CardHeader title={<TitleWithGoBack title={this.props.file.name} />} />

          <div style={styles.fileImageWrapper}>

            <div style={{width: "70%"}}>

              <Card style={styles.innerCard}>
                <CardMedia overlay={<CardTitle subtitle={this.props.file.name} />}>
                  {previewImg}
                </CardMedia>
              </Card>

            </div>

            <div style={{width: "30%"}}>
              {this.renderDownload()}
              {this.renderBasic()}

              {this.renderAuthorities()}

              <Card style={styles.innerCard}>
                <CardHeader title="タグ" />
                <CardText>

                  <Tag
                    { ...this.props }
                    tags={this.props.tags}
                    file={this.props.file} />

                </CardText>
              </Card>

              {this.renderMetaInfos()}
              {this.renderHistories()}

            </div>

          </div>

          {this.renderAuthorityDialog()}
          {this.renderMetaInfoDialog()}

        </Card>

        <DeleteFileDialog
          { ...this.props }
          open={this.props.deleteFileState.open}
          file={this.props.deleteFileState.file} />
        <MoveFileDialog
          { ...this.props }
          open={this.props.moveFileState.open}
          file={this.props.moveFileState.file}
          dir={this.props.selectedDir} />
        <ChangeFileNameDialog
          { ...this.props }
          open={this.props.changeFileNameState.open}
          file={this.props.file}
          errors={this.props.changeFileNameState.errors}
          />

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const file = state.files.length > 0
        ? state.files.filter( file => (
          file._id === ownProps.match.params.id ))[0]
        : {};

  return {
    file: file,
    roles: state.roles.data,
    users: state.users,
    tags: state.tags,
    metaInfo: state.metaInfo,
    tenant: state.tenant,
    fileMetaInfo: state.fileMetaInfo,
    filePreviewState: state.filePreview,
    session: state.session,
    moveFileState: state.moveFile,
    selectedDir: state.selectedDir,
    deleteFileState: state.deleteFile,
    changeFileNameState: state.changeFileName
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

FileDetailContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FileDetailContainer);

export default FileDetailContainer;
