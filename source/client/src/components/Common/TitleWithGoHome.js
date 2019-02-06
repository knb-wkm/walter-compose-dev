import React from "react";
import PropTypes from "prop-types";

// router
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";

// material
import IconButton from "material-ui/IconButton";
import HardwareKeyboardArrowLeft from "material-ui/svg-icons/hardware/keyboard-arrow-left";

const TitleWithGoHome = ({
  title,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Link to={`/home/`} style={{color: "#555",fontSize: 18,textDecoration: "none"}} >
        <HardwareKeyboardArrowLeft />
      </Link>
      <span style={{paddingBottom: 5}} >
      {title}
      </span>
    </div>
  );
};

TitleWithGoHome.propTypes = {
  title: PropTypes.string
};

export default withRouter(TitleWithGoHome);
