import React, { Component } from "react";

// store
import { connect } from "react-redux";

// material ui
import Snackbar from "material-ui/Snackbar";
import CircularProgress from 'material-ui/CircularProgress';

// components
import ErrorReport from "../components/Common/ErrorReport";

const styles = {
  circular: {
    position: "fixed",
    paddingTop: "30%",
    width: "100%",
    height: "100%",
    zIndex: 2000,
    backgroundColor: "#ddd",
    opacity: 0.5,
    textAlign: "center",
    top: 0,
    bottom: 0,
    right:0,
    left:0
  }
};

class NotifyStatusContainer extends Component {
  render() {
    const circular = this.props.loading.start
          ? <CircularProgress size={90} thickness={6} style={styles.circular} />
          : null;

    return (
      <div>
        {circular}
        <Snackbar
          open={this.props.open}
          message={this.props.message} />
        <ErrorReport
          open={this.props.exception.open}
          message={this.props.exception.message}
          detail={this.props.exception.detail} />
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    loading: state.loading,
    open: state.snackbar.open,
    message: state.snackbar.message,
    duration: state.snackbar.duration,
    exception: state.exception
  };
};

NotifyStatusContainer = connect(mapStateToProps)(NotifyStatusContainer);

export default NotifyStatusContainer;
