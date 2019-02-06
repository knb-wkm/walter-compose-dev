import React, { Component } from "react";
import { API } from "../../apis";

// material icons
import FileFolder from "material-ui/svg-icons/file/folder";
import FileFolderOpen from "material-ui/svg-icons/file/folder-open";
import HardwareKeyboardArrowRight from "material-ui/svg-icons/hardware/keyboard-arrow-right";
import HardwareKeyboardArrowDown from "material-ui/svg-icons/hardware/keyboard-arrow-down";

class DirTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewChild: false,
      children: null
    };
  }

  componentWillMount() {
    if (this.state.children === null) {
      this.getChild();
    }
  }

  getChild = () => {
    const api = new API();
    api.fetchDirTree(this.props.node._id)
      .then( payload => {
        this.setState({
          children: payload.data.body.children
        });
      })
      .catch( err => {
        console.log(err);
      });
  };

  renderChildren = () => {
    return this.state.children.map( (child, idx) => {
      return (
        <DirTree key={idx} node={child}
                 selectDirTree={this.props.selectDirTree}
                 dirTree={this.props.dirTree} />
      );
    });
  };

  handleClick = () => {
    if (this.state.children === null ||
        this.state.children === undefined ||
        this.state.children.length === 0) {
      return false;
    }
    else {
      this.setState({ viewChild: !this.state.viewChild });
    }
  };

  render() {
    const style = this.props.dirTree.selected !== null &&
          this.props.dirTree.selected._id === this.props.node._id
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
      <div style={{ marginLeft: 25 }}>

        <div style={{ display: "flex" }}>

          <div style={{ display: "flex" }} 
               onClick={() => this.props.selectDirTree(this.props.node)}>

            <div style={{ paddingTop: 10, paddingBottom: 5 }}
              onClick={this.handleClick}>
              {this.state.viewChild
                ? <HardwareKeyboardArrowDown />
                : <HardwareKeyboardArrowRight />
              }
            </div>

            <div style={style}>
              <div>
                {this.state.viewChild ? <FileFolderOpen /> : <FileFolder />}
              </div>
              <div style={{ paddingLeft: 10, paddingTop: 3 }}>
                {this.props.node.name}
              </div>
            </div>

          </div>

        </div>
        { this.state.viewChild ? this.renderChildren() : null }
      </div>
    );
  }
};

export default DirTree;
