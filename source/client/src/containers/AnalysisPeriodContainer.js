import React, { Component } from "react";
import moment from "moment";

// store
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// material ui
import { Card, CardTitle, CardText } from "material-ui/Card";
import DatePicker from "material-ui/DatePicker";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import Divider from "material-ui/Divider";
import RaisedButton from "material-ui/RaisedButton";

// components
import NavigationContainer from "./NavigationContainer";
import UsagesArea from "../components/Analysis/UsagesArea";

import * as AnalysisActions from "../actions/analysises";
import dateTimeFormatter from '../helper/dateTimeFormatter';

class AnalysisPeriodContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start_date: null,
      end_date: null
    };
  }

  componentWillMount() {
    const start_date = moment().day(-30).format();
    const end_date = moment().format();

    this.props.actions.requestFetchAnalysisPeriod(start_date, end_date);
  }

  render() {
    const cardWidth = 1070;

    return (
      <div>
        <NavigationContainer />
        <Card>
          <CardTitle title="容量管理" />
          <CardText>

            <div style={{ display: "flex", marginBottom: 20, marginLeft: 20 }}>
              <div>
                <DatePicker
                  formatDate={ new dateTimeFormatter("ja").format }
                  DateTimeFormat={ dateTimeFormatter }
                  locale={"ja"}
                  hintText="開始年月日"
                  autoOk={true}
                  onChange={(e, date) => {
                    this.setState({ start_date: date });
                  }} />
              </div>
              <div style={{ marginLeft: 20 }}>
                <DatePicker
                  formatDate={ new dateTimeFormatter("ja").format }
                  DateTimeFormat={ dateTimeFormatter }
                  locale={"ja"}
                  hintText="終了年月日"
                  autoOk={true}
                  onChange={(e, date) => {
                    this.setState({ end_date: date });
                  }} />
              </div>
              <div style={{ marginLeft: 20 }}>
                <RaisedButton
                  label="更新" primary={true}
                  onClick={() => {
                    this.props.actions.requestFetchAnalysisPeriod(
                      this.state.start_date, this.state.end_date
                    );
                  }}
                  />
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div>
                <Card style={{ width: cardWidth }}>
                  <CardTitle subtitle="使用容量推移" />
                  <CardText>
                    <UsagesArea { ...this.props } cardWidth={cardWidth} />
                  </CardText>
                </Card>
              </div>

              <div style={{ marginLeft: 30, width: 180 }}>
                <Divider />
                <Menu>
                  <MenuItem primaryText="サマリー"
                            onTouchTap={() => this.props.history.push("/analysis")} />
                    <MenuItem primaryText="使用容量推移" />
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
    usages: state.analysis.period
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  actions: bindActionCreators(AnalysisActions, dispatch)
});

AnalysisPeriodContainer = connect(
  mapStateToProps, mapDispatchToProps
)(AnalysisPeriodContainer);

export default AnalysisPeriodContainer;
