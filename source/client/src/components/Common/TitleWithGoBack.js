import React from "react";
import PropTypes from "prop-types";

// router
import { withRouter } from "react-router-dom";

// material
import IconButton from "material-ui/IconButton";
import HardwareKeyboardArrowLeft from "material-ui/svg-icons/hardware/keyboard-arrow-left";

const TitleWithGoBack = ({
  title,
  history
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <IconButton onTouchTap={() => history.goBack()}>
        <HardwareKeyboardArrowLeft />
      </IconButton>
      {title}
    </div>
  );
};

TitleWithGoBack.propTypes = {
  title: PropTypes.string
};

export default withRouter(TitleWithGoBack);
