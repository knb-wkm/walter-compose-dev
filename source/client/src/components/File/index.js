import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { uniq } from "lodash";

// material
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';

// mateirla-icon
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import ImageBrightness from 'material-ui/svg-icons/image/brightness-1';

// components
import FileDialogMenu from "./FileDialogMenu";

import * as constants from "../../constants";

const style = {
  checkbox: {
    display: "flex",
    margin: 0,
    padding: 0
  },

  fileDetail: {
    textDecoration: "none",
    color: "#111"
  }
};

class File extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false
    };
  }

  renderCell = (header, file, cellStyle, idx) => {
    let body;

    if (header.meta_info_id === null) {
      if (header.name === "authorities") {
        body = this.renderMember();
      }
      else if (header.value_type === "Date") {
        body = moment(file[header.name]).format("YYYY-MM-DD HH:mm");
      }
      else {
        body = file[header.name];
      }
    } else {
      const meta = file.meta_infos.filter( meta => (
        meta._id === header.meta_info_id
      ));

      if (meta.length === 0) {
        body = "未定義";
      } else {
        if (meta[0].value_type === "Date") {
          body = moment(meta[0].value).format("YYYY-MM-DD HH:mm");
        }
        else {
          body = meta[0].value;
        }
      }
    }

    const color = this.state.hover ? "rgb(0, 188, 212)" : "inherit";

    const linkToFileDetail = () => {
      this.props.history.push(`/files/${this.props.file._id}`);
    };

    let element;

    if (this.props.file.dir_route === undefined) {
      if (idx === 0) {
        element = (
          <div
            key={idx}
            onClick={linkToFileDetail}
            style={{ ...cellStyle, width: header.width, color }}>
            <div style={{ ...cellStyle, padding: 0, width: "100%", justifyContent: "center", alignItems: "center"}}>
              <div style={{ width: "80%" }}>
                {body}
              </div>
              <div style={{ width: "20%" }}>
                {file.tags.map( tag => (
                  <IconButton
                    disableTouchRipple
                    tooltip={tag.label}
                    tooltipPosition="top-center"
                    iconStyle={{ width: 14, height: 14 }}
                    tooltipStyles={{ top: 8 }}
                    style={{ marginLeft: 5 }} >
                    <ImageBrightness color={tag.color} />
                  </IconButton>
                ))}
              </div>
            </div>
          </div>
        );
      }
      else {
        element = (
          <div
            key={idx}
            onClick={linkToFileDetail}
            style={{ ...cellStyle, width: header.width, color }}>
            {body}
          </div>
        );
      }
    } else {
      if (idx === 0) {
        element = (
          <div key={idx} style={{ ...cellStyle, width: header.width, color }}>
            <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
              <div style={{ width: "80%" }}>
                <div onClick={linkToFileDetail}>
                  {body}
                </div>
                <div style={{ fontSize: 12, color: "#aaa"}}
                     onClick={() => (
                       this.props.history.push(`/home/${this.props.file.dir_id}`)
                  )}>
                  場所:
                  {this.props.file.dir_route === ""
                  ? constants.TOP_DIR_NAME : this.props.file.dir_route }
                </div>
              </div>
              <div style={{ width: "20%" }}>
                {file.tags.map( tag => (
                  <IconButton
                    disableTouchRipple
                    tooltip={tag.label}
                    tooltipPosition="top-center"
                    iconStyle={{ width: 14, height: 14 }}
                    tooltipStyles={{ top: 8 }}
                    style={{ marginLeft: 5 }} >
                    <ImageBrightness color={tag.color} />
                  </IconButton>
                ))}
              </div>
            </div>
          </div>
        );
      } else {
        element = (
          <div key={idx} style={{ ...cellStyle, width: header.width, color }}>
            <div onClick={linkToFileDetail} style={{ width: "100%" }}>
              {body}
            </div>
          </div>
        );
      }
    }

    return element;
  };

  renderMember = () => {
    const { authorities } = this.props.file;

    const member = authorities.length > 1
          ? `${uniq(authorities.map( auth => auth.users._id )).length} 人のメンバー`
          : `${authorities[0].users.name} のみ`;

    return (
      <span>
        {member}
      </span>
    );
  };

  render() {
    // headersはインデックス決め打ちなのでjsonを取得できるまではrenderしない
    if (this.props.headers.length === 0) return null;

    const { isDragging, connectDragSource, file } = this.props;
    const { rowStyle, cellStyle, headers } = this.props;

    const opacity = isDragging ? 0.3 : 1;

    const backgroundColor = file.checked ? "rgb(232, 232, 232)" : "inherit";

    const checkOpacity = this.state.hover || file.checked ? 1 : 0.1;

    // react-dndの仕様でinjectされたDnDコンポーネントの関数でラップし返却する
    const elements = (
      <div
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        style={{ ...rowStyle, opacity, backgroundColor }}>

        <div style={{ ...cellStyle, width: headers[0].width }}>
          <Checkbox
            checked={file.checked}
            style={{ ...style.checkbox, opacity: checkOpacity }}
            onCheck={() => {
              this.props.actions.setPageYOffset(window.pageYOffset)
              this.props.actions.toggleFileCheck(file);
            }} />

          <Checkbox
            style={style.checkbox}
            checkedIcon={<ActionFavorite />}
            uncheckedIcon={<ActionFavoriteBorder />}
            checked={file.is_star}
            onCheck={() => {
              this.props.actions.setPageYOffset(window.pageYOffset)
              this.props.actions.toggleStar(file)
            }} />
        </div>

        {headers.filter( header => (
          !["file_checkbox", "action"].includes(header.name)
          )).map( (header, idx) => (
          this.renderCell(header, file, cellStyle, idx)
        ))}

        <div style={{ ...cellStyle, width: headers[4].width }}>
          <FileDialogMenu
            actions={this.props.actions}
            file={this.props.file}
            hover={this.state.hover}
            trashDirId={this.props.tenant.trashDirId} />
        </div>
      </div>
    );

    return connectDragSource ? connectDragSource(elements) : elements;
  }
}

File.propTypes = {
  history: PropTypes.object.isRequired,
  dir_id: PropTypes.string.isRequired,
  rowStyle: PropTypes.object.isRequired,
  cellStyle: PropTypes.object.isRequired,
  headers: PropTypes.array.isRequired,
  file: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired
};

export default File;
