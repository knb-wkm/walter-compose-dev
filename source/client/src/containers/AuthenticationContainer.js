import React, { Component } from "react";
import { withRouter, Redirect, Route } from "react-router-dom";
import { connect } from "react-redux";

import * as actions from "../actions";

// JWTを保持していない && store.sessionに認証情報がセットされていない
// 場合のみログイン画面にリダイレクトする
class AuthenticationContainer extends Component {
  componentWillMount() {
    if (!this.props.session.login) this.userWillTransfer();
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.session.login) this.userWillTransfer();
  }

  haveToken = () => {
    const token = localStorage.getItem("token");
    return !(token === null || token === undefined);
  }

  userWillTransfer() {
    const token = localStorage.getItem("token");

    if (token) {
      this.props.requestVerifyToken(token);
      this.props.requestFetchNotification();
    }
  }

  render() {
    const tenant_name = localStorage.getItem("tenant_name");

    return (
      this.haveToken() ? (
        <Route children={this.props.children} />
      ) : (
        <Redirect to={`/${tenant_name}/login`} />
      )
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    session: state.session
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  requestLoginSuccess: (message, user_id) => {
    dispatch(actions.requestLoginSuccess(message, user_id));
  },
  putTenant: (tenant_id, name, dirId, trashDirId, trashIconVisibility) => {
    dispatch(actions.putTenant(tenant_id, name, dirId, trashDirId, trashIconVisibility));
  },
  requestVerifyToken: (token) => {
    dispatch(actions.requestVerifyToken(token));
  },
  requestFetchNotification: () => {
    dispatch(actions.requestFetchNotification());
  }
});

AuthenticationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthenticationContainer);

export default withRouter(AuthenticationContainer);

