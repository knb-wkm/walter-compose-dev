import React, { Component } from "react";

// store
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// material ui
import { Card, CardTitle, CardText } from "material-ui/Card";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import ActionDescription from "material-ui/svg-icons/action/description";
import Divider from "material-ui/Divider";

// components
import NavigationContainer from "./NavigationContainer";
import MetaInfoTableHeader from "../components/MetaInfo/MetaInfoTableHeader";
import MetaInfoTableBody from "../components/MetaInfo/MetaInfoTableBody";

// actions
import * as FileActions from "../actions/files";

class MetaInfoContainer extends Component {
  componentWillMount() {
    this.props.actions.requestFetchMetaInfos();
  }

  renderMetaInfos = (metaInfos) => {
    return metaInfos.length === 0
      ?
      (
        <TableRow>
          <TableRowColumn>表示するメタ情報はありません</TableRowColumn>
        </TableRow>
      )
      : metaInfos.map( (meta, idx) => (
        <MetaInfoTableBody meta={meta} key={idx} />
      ));
  };

  render() {
    const headers = [
      { name: "表示名" },
      { name: "データ型" },
      { name: "編集" },
    ];

    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardText>
            <div style={{ display: "flex" }}>
              <div style={{ width: "75%" }}>
                <CardTitle title="メタ情報管理" />
              </div>
            </div>

            <div style={{ display: "flex" }}>

              <div style={{ width: "80%" }}>
                <Table>
                  <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <MetaInfoTableHeader headers={headers} />
                  </TableHeader>
                  <TableBody displayRowCheckbox={false}>
                    {this.renderMetaInfos(this.props.metaInfos)}
                  </TableBody>
                </Table>
              </div>

              <div style={{ width: "20%" }}>
                <Divider />
                <Menu>
                  <MenuItem
                    primaryText="メタ情報作成"
                    leftIcon={<ActionDescription />}
                    onTouchTap={() => (
                      this.props.history.push("/meta_infos/create")
                    )}
                    />
                </Menu>
              </div>
            </div>
          </CardText>
        </Card>
      </div>
    );
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    tenant: state.tenant,
    metaInfos: state.metaInfo.meta_infos
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(FileActions, dispatch)
});

MetaInfoContainer = connect(mapStateToProps, mapDispatchToProps)(MetaInfoContainer);

export default MetaInfoContainer;
