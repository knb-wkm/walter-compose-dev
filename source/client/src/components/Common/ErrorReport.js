import React from "react";
import PropTypes from "prop-types";

import Snackbar from "material-ui/Snackbar";
import {red900, grey50} from 'material-ui/styles/colors';

const ErrorReport = ({
  open,
  message,
  detail = null
}) => {
  const transform = message
        ? "translate3d(0, 0, 0)" : "translate3d(0px, -50px, 0px)";

  const styles = {
    messageStyle: {
      lineHeight: "28px",
      color: grey50
    },
    bodyStyle: {
      backgroundColor: red900,
      maxWidth: "100%",
      height: "auto",
      paddingTop: 10,
      paddingLeft: 24,
      paddingBottom: 10,
      whiteSpace: "pre-line"
    },
    style: {
      top: 0,
      bottom: "auto",
      left: (window.innerWidth - 288) * 0.42,
      transform
    }
  };

  const messageBody = detail === null
        ? message
        : message + "\n" + detail;

  return (
    <Snackbar
      open={open}
      message={messageBody}
      style={styles.style}
      bodyStyle={styles.bodyStyle}
      contentStyle={styles.messageStyle}
      />
  );
};

ErrorReport.propTypes = {
  open: PropTypes.bool,
  message: PropTypes.string
};

export default ErrorReport;
