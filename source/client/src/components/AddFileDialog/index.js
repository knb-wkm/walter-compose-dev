import React from "react";
import PropTypes from "prop-types";

// material
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import FileCloudUpload from "material-ui/svg-icons/file/cloud-upload";
import ActionDelete from "material-ui/svg-icons/action/delete";
import IconButton from 'material-ui/IconButton';

// DnD
import Dropzone from "react-dropzone";

const styles = {
  dialog: {
    width: "70%",
    maxWidth: "none"
  },
  dropzone: {
    width: "90%",
    height: "90%",
    borderStyle: "dashed",
    borderColor: "rgb(130, 130, 130)",
    borderWidth: 3,
    padding: 20,
    marginTop: 30,
    marginLeft: 15,
    textAlign: "center"
  },
  cloudIcon: {
    width: 70,
    height: 70,
    color: "rgb(170, 170, 170)",
    paddingBottom: 20
  },
  bufferWrapper: {
    marginTop: 30,
    marginLeft: 20
  },
  bufferRow: {
    width: "95%",
    display: "flex",
    borderBottom: "1px solid lightgray",
    paddingBottom: 10,
    paddingTop: 10
  },
  bufferCol: {
    display: "flex"
  },
  bufferMime: {
    display: "flex",
    margin: 0,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(0, 188, 212)",
    color: "white"
  }
};

const AddFileDialog = ({
  dir_id,
  open,
  uploadFiles,
  filesBuffer,
  closeDialog,
  actions
}) => {
  const renderFilesBuffer = (file, idx) => {
    return (
      <div style={styles.bufferRow} key={idx}>
        <div style={{...styles.bufferCol, width: "30%"}}>
          <div style={styles.bufferMime}>
            {file.mime_type}
          </div>
        </div>
        <div style={{...styles.bufferCol, width: "50%", padding: 10}}>
          {file.name}
        </div>
        <div style={{...styles.bufferCol, width: "15%", padding: 10}}>
          {file.size} byte
        </div>
        <div style={{...styles.bufferCol, width: "5%" }}>
          <IconButton>
            <ActionDelete onClick={() => actions.deleteFileBuffer(file)} />
          </IconButton>
        </div>
      </div>
    );
  };

  const dialogActions = [
    (
      <FlatButton
        label="閉じる"
        primary={true}
        onTouchTap={() => {
          actions.clearFilesBuffer();
          closeDialog();
        }} />
    )
  ];

  return (
    <div>
      <Dialog
        title="ファイルをアップロード"
        actions={dialogActions}
        modal={true}
        open={open}
        onRequestClose={closeDialog}
        autoScrollBodyContent={true}
        contentStyle={styles.dialog}
        >

        <div>
          <Dropzone
            onDrop={(files) => actions.uploadFiles(dir_id, files)}
            style={styles.dropzone}>

            <FileCloudUpload style={styles.cloudIcon} /><br />
            <div>
              ファイルをドロップまたは<br /><br />
              <RaisedButton primary={true} label="ファイルを選択" />
            </div>
          </Dropzone>
        </div>

        <div style={styles.bufferWrapper}>
          {filesBuffer.map(renderFilesBuffer)}
        </div>

      </Dialog>
    </div>
  );
};

AddFileDialog.propTypes = {
  dir_id: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  filesBuffer: PropTypes.array.isRequired,
  closeDialog: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

export default AddFileDialog;
