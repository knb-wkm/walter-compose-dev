import React, { Component } from "react";
import { DropTarget } from 'react-dnd';

const fileTarget = {
  drop(props, monitor) {
    if (props.onDrop) {
      props.onDrop(props, monitor);
    }
  }
};

class TableBodyWrapper extends Component {
  render() {
    // const { accepts, onDrop } = this.props;
    // const { canDrop, isOver } = this.props;
    const { connectDropTarget } = this.props;
    // const isActive = canDrop && isOver;

    return connectDropTarget(
      <div>{this.props.children}</div>
    );
  }
}

export default DropTarget(props => props.accepts, fileTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(TableBodyWrapper);
