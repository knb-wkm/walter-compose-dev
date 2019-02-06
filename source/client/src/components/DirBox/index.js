import React from "react";
import PropTypes from "prop-types";

// router
import { Link } from "react-router-dom";

const DirBox = ({
  dir,
  styles
}) => {
  if (dir === "sep") {
    return (
      <div style={styles.dir_list}>
        &gt;
      </div>
    );
  }
  else {
    return (
      <div style={styles.dir_list}>
        <Link to={`/home/${dir._id}`} style={styles.dir}>
          {dir.name}
        </Link>
      </div>
    );
  }
};

DirBox.propTypes = {
//  dir: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired
};

export default DirBox;
