import React from "react";
import moment from "moment";
import PropTypes from "prop-types";

// material ui
import TextField from "material-ui/TextField";
import * as constants from "../../constants";

const styles = {
  metaRow: {
    marginTop: 10,
    display: "flex"
  },
  metaCell: {
    marginRight: 20,
    width: "20%"
  }
};

const FileBasic = ({ file }) => {
  return (
    <div>
      <div style={styles.metaRow}>
        <div style={styles.metaCell}>ファイル名</div>
        {file.name}
      </div>
      <div style={styles.metaRow}>
        <div style={styles.metaCell}>場所</div>
        <div>{file.dir_route === "" ? constants.TOP_DIR_NAME : file.dir_route }</div>
      </div>
      <div style={styles.metaRow}>
        <div style={styles.metaCell}>サイズ</div>
        <div>{file.size}</div>
      </div>
      <div style={styles.metaRow}>
        <div style={styles.metaCell}>最終更新</div>
        <div>{moment(file.modified).format("YYYY-MM-DD HH:mm")}</div>
      </div>
    </div>
  );
};

FileBasic.propTypes = {
  file: PropTypes.object.isRequired
};

export default FileBasic;
