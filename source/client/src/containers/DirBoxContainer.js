import React, { Component } from "react";

// store
import { connect } from "react-redux";

// components
import DirBox from "../components/DirBox";

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: 30,
    marginLeft: 20
  },
  dir_list: {
    marginTop: 10,
    marginLeft: 10,
    padding: 5
  },
  dir: {
    color: "#555",
    fontSize: 18,
    textDecoration: "none"
  }
};

class DirBoxContainer extends Component {
  render() {
    return (
      <div className="dir-box" style={styles.wrapper}>
        {this.props.dirs.map( (dir, idx) => {
          return <DirBox key={idx} styles={styles} dir={dir} />;
        })}
      </div>
    );      
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    dirs: state.dirs
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({});

DirBoxContainer = connect(mapStateToProps, mapDispatchToProps)(DirBoxContainer);

export default DirBoxContainer;

