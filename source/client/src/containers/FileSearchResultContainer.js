import React, { Component } from "react";
import YouAreI from  "youarei";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material ui
import { Card } from "material-ui/Card";

// components
import NavigationContainer from "./NavigationContainer";
import FileSearchContainer from "./FileSearchContainer";
import FileActionContainer from "./FileActionContainer";
import FileListHeader from "../components/FileListHeader";
import Dir from "../components/Dir";
import File from "../components/File";
import FileOperationDialogContainer from "./FileOperationDialogContainer";
import TitleWithGoHome from "../components/Common/TitleWithGoHome";

// actions
import * as FileActions from "../actions/files";
import { LIST_DEFAULT, LIST_SEARCH_SIMPLE, LIST_SEARCH_DETAIL } from "../constants/index";

const styles = {
  title: {
    marginTop: 40,
    marginLeft: 30,
    padding: 5,
    fontSize: 18
  },
  search_summary: {
    marginTop: 20,
    marginLeft: 30,
    padding: 5,
    fontSize: 14,
    color: "rgb(85, 85, 85)"
  },
  table_header_wrap: {
    display: "flex",
    width: "95%",
    marginLeft: 30,
    borderBottom: "1px solid lightgray",
    backgroundColor: "inherit"
  },
  table_header: {
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
  table_row: {
    display: "flex",
    width: "95%",
    marginLeft: 30,
    borderBottom: "1px solid lightgray",
    backgroundColor: "inherit"
  },
  table_cell: {
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

class FileSearchResultContainer extends Component {

  componentWillMount() {
    this.props.actions.setPageYOffset(0);
    this.props.actions.requestFetchDisplayItems();
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

  componentWillReceiveProps(nextProps) {

    // 簡易検索ページネーション実行
    if (this.props.page < nextProps.page && this.props.fileListType.list_type === LIST_SEARCH_SIMPLE ) {
      this.props.actions.fetchSearchFileSimple(
        nextProps.page,
        nextProps.fileSortTarget.sorted,
        nextProps.fileSortTarget.desc
      );
    }

    // 詳細検索ページネーション実行
    if (this.props.page < nextProps.page && this.props.fileListType.list_type === LIST_SEARCH_DETAIL ) {
      this.props.actions.fetchSearchFileDetail(
        nextProps.page,
        nextProps.fileSortTarget.sorted,
        nextProps.fileSortTarget.desc
      );
    }


    if (this.props.fileSortTarget !== nextProps.fileSortTarget) {
      this.props.actions.setPageYOffset(0);
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

    // // vdomのレンダリングが走る際、ページ上部にジャンプするため
    // // yOffsetを記憶しておき、レンダリング後にyOffsetにジャンプする
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
      this.props.actions.setPageYOffset(window.pageYOffset);
      this.setState({ yOffset: window.pageYOffset });
      this.props.actions.fileNextPage();
    }
  };

  renderHeaders = () => {
    return this.props.headers.map( (header, idx) => (
      <FileListHeader
        { ...this.props }
        key={idx}
        header={header}
        style={styles.table_header} />
    ));
  };

  renderFileIsEmpty = () => {
    return (
      <div style={styles.table_row}>
        <div style={styles.table_cell}></div>
        <div style={styles.table_cell}></div>
        <div style={styles.table_cell}>
          一致したファイル、フォルダが存在しませんでした
        </div>
      </div>
    );
  };

  renderFile = (file, idx) => {
    const dirComponent = (
      <Dir
        { ...this.props }
        key={idx}
        dir={file}
        rowStyle={styles.table_row}
        cellStyle={styles.table_cell}
        headers={this.props.headers} />
    );

    const fileComponent = (
      <File
        { ...this.props }
        key={idx}
        file={file}
        rowStyle={styles.table_row}
        cellStyle={styles.table_cell}
        headers={this.props.headers} />
    );
    return file.is_dir ? dirComponent : fileComponent;
  };

  render() {
    return (
      <div>
        <NavigationContainer />

        <Card>
          <div style={{ display: "flex" }}>
            <div style={{ width: "40%" }}>
              <div style={styles.title}>
                <TitleWithGoHome title="検索結果" />
              </div>
              <div style={styles.search_summary}>
                ファイル、フォルダの検索結果 {this.props.total} 件
              </div>
            </div>

            <div style={{ width: "60%" }}>
              <FileSearchContainer />
            </div>
          </div>

          <div style={{ display: "flex" }}>
            <div style={{ width: "78%" }}>
              <div style={styles.table_header_wrap}>
                {this.renderHeaders()}
              </div>
              <div style={{ paddingBottom: 30 }}>
                {this.props.files.length === 0
                  ? this.renderFileIsEmpty()
                  : this.props.files.map( ( file, idx) => this.renderFile(file, idx) )
                }
              </div>
            </div>

            <div style={{ width: "22%" }}>
              <FileActionContainer isSearch={true} />
            </div>
          </div>
        </Card>

        <FileOperationDialogContainer { ...this.props } />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    files: state.files,
    tenant: state.tenant,
    total: state.filePagination.total,
    page: state.filePagination.page,
    yOffset: state.filePagination.yOffset,
    fileSortTarget: state.fileSortTarget,
    headers: state.displayItems,
    fileListType: state.fileListType
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

FileSearchResultContainer = connect(
  mapStateToProps, mapDispatchToProps
)(FileSearchResultContainer);

export default FileSearchResultContainer;
