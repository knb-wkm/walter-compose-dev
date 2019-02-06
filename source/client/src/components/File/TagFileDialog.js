import React, { Component } from "react";
import PropTypes from "prop-types";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";
import Tag from "../Tag";

import * as FileActions from "../../actions/files";

const TagFileDialog = ({
  open,
  file,
  tags,
  actions
}) => {
  const btnActions = (
    <FlatButton
      label="閉じる"
      primary={true}
      onTouchTap={actions.toggleFileTagDialog}
      />
  );

  return (
    <Dialog
      title="タグ編集"
      open={open}
      modal={false}
      actions={btnActions} >

      <Tag
        file={file}
        tags={tags}
        actions={actions}
        />

    </Dialog>
  );
};

TagFileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.object,
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

export default TagFileDialog;
