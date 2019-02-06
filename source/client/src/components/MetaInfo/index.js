import React, { Component } from "react";
import moment from "moment";

// material ui
import RaisedButton from "material-ui/RaisedButton";
import AutoComplete from "material-ui/AutoComplete";
import TextField from "material-ui/TextField";
import DatePicker from "material-ui/DatePicker";
import dateTimeFormatter from '../../helper/dateTimeFormatter';

const styles = {
  row: {
    display: "flex"
  },
  cell: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid lightgray",
    textAlign: "left",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    height: 45,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 5,
    paddingTop: 15
  }
};

class MetaInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addable: false,
      text: "",
      metaInfo: null,
      metaInfoValue: null
    };
  }

  renderMetaInfo = (meta, idx) => {
    const deleteMetaInfoToFile = (file, metaInfo) => {
      this.props.deleteMetaInfoToFile(file, metaInfo);
    };

    const value = meta.value_type === "Date"
          ? moment(meta.value).format("YYYY-MM-DD HH:mm")
          : meta.value;

    return (
      <div key={idx} style={styles.row}>
        <div style={{...styles.cell, width: "15%"}}>{meta.label}</div>
        <div style={{...styles.cell, width: "25%"}}>{value}</div>
        <div style={{...styles.cell, width: "10%"}}>
          <RaisedButton
            label="削除"
            onClick={() => deleteMetaInfoToFile(this.props.file, meta) } />
        </div>
      </div>
    );
  };

  newMetaTable = () => {
    const addMetaInfoToFile = (file) => {
      this.props.addMetaInfoToFile(
        file,
        this.state.metaInfo,
        this.state.metaInfoValue
      );

      this.setState({
        addable: false ,
        text: "",
        metaInfo: null,
        metaInfoValue: null
      });
    };

    const onNewRequest = (searchText) => {
      this.setState({ text: searchText.label });
      this.setState({ metaInfo: searchText });
    };

    const dataSourceConfig = {
      text: "label",
      value: "_id"
    };

    // 登録されていないメタ情報のみを抽出
    const metaInfos = this.props.metaInfo.filter( meta => {
      const ids = this.props.file.meta_infos.map( meta => meta._id );
      return !ids.includes(meta._id);
    });

    const renderForm = () => {
      if (this.state.metaInfo === null) return null;

      switch(this.state.metaInfo.value_type) {
      case "Date":
        return (
          <DatePicker
            formatDate={ new dateTimeFormatter("ja").format }
            DateTimeFormat={ dateTimeFormatter }
            locale={"ja"}
            onChange={ (e, value) => this.setState({ metaInfoValue: value }) }
            floatingLabelText="日付を入力"
            autoOk={true}
            hintText="日付を入力"
            />
        );
      case "String":
        return (
          <TextField
            ref="metaValue"
            onChange={ () => {
              this.setState({ metaInfoValue: this.refs.metaValue.getValue() });
            }}
            hintText="値を入力"
            floatingLabelText="値を入力" />
        );
      default:
        return null;
      }
    };

    return (
      <div style={styles.row}>

        <div style={{...styles.cell, width: "15%"}}>

          <AutoComplete
            hintText="メタ情報を選択"
            searchText={this.state.text}
            floatingLabelText="メタ情報を選択"
            onTouchTap={() => this.setState({text: ""})}
            onNewRequest={onNewRequest}
            filter={AutoComplete.noFilter}
            openOnFocus={true}
            dataSource={metaInfos}
            dataSourceConfig={dataSourceConfig}
            />

        </div>
        <div style={{...styles.cell, width: "25%"}}>

          {renderForm()}

        </div>
        <div style={{...styles.cell, width: "10%"}}>
          <RaisedButton
            label="作成"
            onClick={() => addMetaInfoToFile(this.props.file, {}) } />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.props.file.meta_infos.map(
          (meta, idx) => this.renderMetaInfo(meta, idx)
        )}

        {this.state.addable ? this.newMetaTable() : null}

        <div style={{ marginTop: 20 }}>

          <RaisedButton
            disabled={this.state.addable}
            label="追加"
            onClick={() => this.setState({ addable: true })} />

        </div>
      </div>
    );
  }
}

export default MetaInfo;
