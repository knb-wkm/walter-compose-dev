import React, { Component } from "react";

// router
import { withRouter } from "react-router-dom";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// DnD
import TableBodyWrapper from "../components/FileListBody/TableBodyWrapper";
import withDragDropContext from "../components/FileListBody/withDragDropContext";
import { NativeTypes } from "react-dnd-html5-backend";
import { DragSource, DropTarget } from "react-dnd";

// components
import FileListHeader from "../components/FileListHeader";

// dir components
import Dir from "../components/Dir";
import File from "../components/File";
import FileOperationDialogContainer from "./FileOperationDialogContainer";

// actions
import * as FileActions from "../actions/files";
import { LIST_DEFAULT, LIST_SEARCH_SIMPLE, LIST_SEARCH_DETAIL } from "../constants/index";

const styles = {
  row: {
    display: "flex",
    width: "95%",
    marginLeft: 30,
    borderBottom: "1px solid lightgray",
    backgroundColor: "inherit"
  },
  cell: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    textAlign: "left",
    fontFamily: "Roboto sans-serif",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    backgroundColor: "inherit"
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 24,
    textAlign: "left",
    fontFamily: "Roboto sans-serif",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    backgroundColor: "inherit",
    color: "rgb(158, 158, 158)",
    fontSize: 12,
    height: 48
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    textAlign: "left",
    fontFamily: "Roboto sans-serif",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    backgroundColor: "inherit",
    height: 70,
    color: "rgb(80, 80, 80)",
    fontSize: 13
  }
};

const fileSource = {
  beginDrag(props) {
    return {
      file: props.file
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    if (dropResult) {
      props.actions.moveFile(dropResult.dir, item.file);
    }
  }
};

const fileTarget = {
  drop(props) {
    return {
      dir: props.dir
    };
  }
};

const dragCollect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
};

const dropCollect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
};

class FileListContainer extends Component {

  componentWillMount() {
    this.props.actions.requestFetchDisplayItems();

    // @fixme 引数大杉
    this.props.actions.requestFetchFiles(
      this.props.match.params.id
    );
    this.props.actions.setFileListType(LIST_DEFAULT);
    this.props.actions.requestFetchMetaInfos();
    this.props.actions.requestFetchUsers();
    this.props.actions.requestFetchRoles();
    this.props.actions.initFilePagination();
    this.props.actions.requestFetchDir(this.props.dir_id);
  }

  componentWillUnmount() {
    window.scrollTo(0, 0);
    this.props.actions.setPageYOffset(0);
    window.removeEventListener("scroll",this.onScroll);
  }

  componentDidMount() {
    this.props.actions.setPageYOffset(0);
    window.addEventListener("scroll", this.onScroll);
  }

  componentWillUpdate(nextProps, nextState) {
    if(this.props.dir_id !== nextProps.dir_id){
      this.props.actions.requestFetchDir(nextProps.dir_id);
      this.props.actions.initFilePagination();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.props.actions.requestFetchFiles(nextProps.match.params.id);
    }

    // onScroll paginationで次のページにインクリメントされた際のイベント
    if (this.props.page < nextProps.page) {
      this.props.actions.requestFetchFiles(
        nextProps.match.params.id,
        nextProps.page,
        nextProps.fileSortTarget.sorted,
        nextProps.fileSortTarget.desc
      );
    }

    if (this.props.fileSortTarget !== nextProps.fileSortTarget) {

      switch (this.props.fileListType.list_type) {
        case LIST_SEARCH_SIMPLE:
          this.props.actions.fetchSearchFileSimple(
            0,
            nextProps.fileSortTarget.sorted,
            nextProps.fileSortTarget.desc
          );
        break;
        case LIST_SEARCH_DETAIL:
          this.props.actions.fetchSearchFileDetail(
            0,
            nextProps.fileSortTarget.sorted,
            nextProps.fileSortTarget.desc
          );
        break;

        case LIST_DEFAULT:
        default:
          this.props.actions.requestFetchFiles(
            nextProps.match.params.id,
            null,
            nextProps.fileSortTarget.sorted,
            nextProps.fileSortTarget.desc
          );
          break;
      }
    }

    // vdomのレンダリングが走る際、ページ上部にジャンプするため
    // yOffsetを記憶しておき、レンダリング後にyOffsetにジャンプする
    window.setTimeout(() => window.scrollTo(0, this.props.yOffset), 0);
  }

  // onScroll pagination
  onScroll = (e) => {
    const nextPageThreshold = 100 + (this.props.page + 1) * 30 * 40;

    if (
      window.pageYOffset > nextPageThreshold
      && this.props.files.length < this.props.total
    ) {
      // yOffsetを記憶しておく
      this.props.actions.setPageYOffset( window.pageYOffset );
      this.props.actions.fileNextPage();
    }
  };

  // finder, explorerからファイルをドロップするハンドラ
  handleFileDrop = (item, monitor) => {
    if (monitor) {
      const disableFileBuffer = true
      this.props.actions.uploadFiles(
        this.props.match.params.id, monitor.getItem().files, disableFileBuffer
      );
    }
  }

  renderRow = (file, idx) => {
    const DirDroppable = DropTarget("file", fileTarget, dropCollect)(Dir);

    const dirComponent = (
      <DirDroppable
        { ...this.props }
        key={idx}
        dir={file}
        rowStyle={styles.row}
        cellStyle={styles.tableRow}
        headers={this.props.headers}
        />
    );

    const FileDraggable = DragSource("file", fileSource, dragCollect)(File);

    const fileComponent = (
      <FileDraggable
        { ...this.props }
        key={idx}
        rowStyle={styles.row}
        cellStyle={styles.tableRow}
        headers={this.props.headers}
        file={file}
        setYOffset={(y) => this.props.actions.setPageYOffset(y)}
        />
    );

    return file.is_dir ? dirComponent : fileComponent;
  };

  renderFileIsEmpty = () => {
    return (
      <div style={styles.row}>
        <div style={styles.tableRow}></div>
        <div style={styles.tableRow}></div>
        <div style={styles.tableRow}>
          フォルダ内にファイルが存在しません
        </div>
      </div>
    );
  };

  render() {
    const { FILE } = NativeTypes;

    return (
      <div>
        <div style={styles.row}>
          {this.props.headers.map( (header, idx) => (
            <FileListHeader
              key={idx}
              header={header}
              style={styles.tableHeader}
              { ...this.props } />
          ))}
        </div>

        <TableBodyWrapper
          accepts={[FILE]}
          onDrop={this.handleFileDrop}>

          <div style={{ paddingBottom: 30 }} >
            {this.props.files.length === 0
              ? this.renderFileIsEmpty()
              : this.props.files.map( (file, idx) => this.renderRow(file, idx) )}
          </div>

        </TableBodyWrapper>

        <FileOperationDialogContainer { ...this.props } />
      </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    files: state.files,
    selectedDir: state.selectedDir,
    fileSortTarget: state.fileSortTarget,
    deleteFileState: state.deleteFile,
    dirTree: state.dirTree,
    tenant: state.tenant,
    total: state.filePagination.total,
    page: state.filePagination.page,
    yOffset: state.filePagination.yOffset,
    downloadBlob: state.downloadFile,
    addAuthority: state.addAuthorityFile,
    headers: state.displayItems,
    fileListType: state.fileListType
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

FileListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FileListContainer);

export default withRouter(withDragDropContext(FileListContainer));
