import React, { Component } from "react";

// store
import { connect } from "react-redux";

// components
import DirTree from "../components/DirTree";

// material
import FileFolderOpen from "material-ui/svg-icons/file/folder-open";
import HardwareKeyboardArrowDown from "material-ui/svg-icons/hardware/keyboard-arrow-down";
import { Card, CardText } from 'material-ui/Card';

// actions
import { requestFetchDirTree, selectDirTree } from "../actions";

class DirTreeContainer extends Component {
  componentWillMount() {
    this.props.requestFetchDirTree(this.props.tenant.dirId);
  }

  renderDirTree = (node, idx) => {
    return (
      <DirTree key={idx} node={node}
               selectDirTree={this.props.selectDirTree}
               dirTree={this.props.dirTree} />
    );
  };

  render() {
    if (this.props.dirTree.loading) {
      return <div></div>;
    } else {
      const { node, selected } = this.props.dirTree;

      const style = selected !== null && selected._id === node._id
            ? {
              display: "flex",
              paddingTop: 10,
              paddingBottom: 5,
              paddingLeft: 10,
              paddingRight: 10,
              backgroundColor: "rgb(240, 240, 240)"
            }
            : {
              display: "flex",
              paddingTop: 10,
              paddingBottom: 5,
              paddingLeft: 10,
              paddingRight: 10
            };

      return (
        <Card style={{ marginTop: 30, marginBottom: 30 }}>
          <CardText>
            <div style={{ display: "flex" }}>
              <div style={{ paddingTop: 10, paddingBottom: 5 }}>
                <HardwareKeyboardArrowDown />
              </div>
              <div style={style}
                   onClick={() => this.props.selectDirTree(node)}>
                <div>
                  <FileFolderOpen />
                </div>
                <div style={{ marginLeft: 10, paddingTop: 3 }}>
                  {node.name}
                </div>
              </div>
            </div>

            {node.children.map( (node, idx) => this.renderDirTree(node, idx) )}

          </CardText>
        </Card>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tenant: state.tenant,
    dirTree: state.dirTree,
    selectedDir: state.selectedDir
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  selectDirTree: (dir) => { dispatch(selectDirTree(dir)); },
  requestFetchDirTree: (root_id) => { dispatch(requestFetchDirTree(root_id)); }
});

DirTreeContainer = connect(mapStateToProps, mapDispatchToProps)(DirTreeContainer);

export default DirTreeContainer;
