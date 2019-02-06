import React, { Component } from "react";
import moment from "moment";

// store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// material ui
import { Card, CardTitle, CardText } from 'material-ui/Card';
import DatePicker from 'material-ui/DatePicker';
import Divider from "material-ui/Divider";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";

// components
import NavigationContainer from "./NavigationContainer";
import TotalPie from "../components/Analysis/TotalPie";
import NoShapePie from "../components/Analysis/NoShapePie";
import ShapePie from "../components/Analysis/ShapePie";

// actions
import * as AnalysisActions from "../actions/analysises";
import dateTimeFormatter from '../helper/dateTimeFormatter';

class AnalysisContainer extends Component {
  componentWillMount() {
    const reported_at = moment().format();
    this.props.actions.requestFetchAnalysis(reported_at);
  }

  render() {
    const rowWidth = 1050;

    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title="容量管理" />
          <CardText>

            <div style={{ marginBottom: 20, marginLeft: 20 }}>
              <DatePicker
                formatDate={ new dateTimeFormatter("ja").format }
                DateTimeFormat={ dateTimeFormatter }
                locale={"ja"}
                onChange={(e, date) => {
                  this.props.actions.requestFetchAnalysis(date);
                }}
                autoOk={true}
                hintText="該当日を指定" />
            </div>

            <div style={{ display: "flex" }}>
              <div>
                <div style={{ display: "flex" }}>
                  <Card style={{ width: rowWidth / 3}}>
                    <CardTitle subtitle="使用率"/>
                    <CardText>
                      <TotalPie { ...this.props } cardWidth={ rowWidth / 3 } />
                    </CardText>
                  </Card>

                  <Card style={{ width: rowWidth / 3, marginLeft: 10 }}>
                    <CardTitle subtitle="ファイル数" />
                    <CardText>
                      <ShapePie
                        data={this.props.fileCount}
                        pieColor="#ff7f0e"
                        cardWidth={ rowWidth / 3 } />
                    </CardText>
                  </Card>

                  <Card style={{ width: rowWidth / 3, marginLeft: 10 }}>
                    <CardTitle subtitle="フォルダ数" />
                    <CardText>
                      <ShapePie
                        data={this.props.folderCount}
                        pieColor="#2ca02c"
                        cardWidth={ rowWidth / 3 } />
                    </CardText>
                  </Card>
                </div>

                <div style={{ display: "flex", marginTop: 30 }}>
                  <Card style={{ width: rowWidth / 2 }}>
                    <CardTitle subtitle="使用率(フォルダ毎)" />
                    <CardText>
                      <NoShapePie
                        data={this.props.useRateFolder}
                        cardWidth={ rowWidth / 2 } />
                    </CardText>
                  </Card>

                  <Card style={{ width: rowWidth / 2, marginLeft: 20 }}>
                    <CardTitle subtitle="使用率(ユーザ/グループ毎)" />
                    <CardText>
                      <NoShapePie
                        data={this.props.useRateUser}
                        cardWidth={ rowWidth / 2 } />
                    </CardText>
                  </Card>
                </div>

                <div style={{ display: "flex", marginTop: 30 }}>
                  <Card style={{ width: rowWidth / 2 }}>
                    <CardTitle subtitle="使用率(ファイル種別毎)" />
                    <CardText>
                      <NoShapePie
                        data={this.props.useRateMimeType}
                        cardWidth={ rowWidth / 2 } />
                    </CardText>
                  </Card>

                  <Card style={{ width: rowWidth / 2, marginLeft: 20 }}>
                    <CardTitle subtitle="使用率(タグ毎)" />
                    <CardText>
                      <NoShapePie
                        data={this.props.useRateTag}
                        cardWidth={ rowWidth / 2 } />
                    </CardText>
                  </Card>
                </div>
              </div>

              <div style={{ marginLeft: 30, width: 180 }}>
                <Divider />
                <Menu>
                  <MenuItem primaryText="サマリー" />
                  <MenuItem primaryText="使用容量推移"
                            onTouchTap={() => this.props.history.push("/analysis/periods")} />
                </Menu>
                <Divider />
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
    useRateTotal: state.analysis.daily.useRateTotal,
    usages: state.analysis.daily.usages,
    useRateFolder: state.analysis.daily.useRateFolder,
    useRateUser: state.analysis.daily.useRateUser,
    useRateMimeType: state.analysis.daily.useRateMimeType,
    useRateTag: state.analysis.daily.useRateTag,
    fileCount: state.analysis.daily.fileCount,
    folderCount: state.analysis.daily.folderCount
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(AnalysisActions, dispatch)
});

AnalysisContainer = connect(mapStateToProps, mapDispatchToProps)(AnalysisContainer);
export default AnalysisContainer;
