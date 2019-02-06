import React, { Component } from "react";
import { Redirect } from "react-router-dom";

// store
import { connect } from "react-redux";

// material ui
import { Card, CardTitle, CardText, CardActions } from "material-ui/Card";
import TextField from "material-ui/TextField";
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from "material-ui/AppBar";

// actions
import * as actions from "../actions";

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  text: {
    width: 330
  },

  card: {
    marginTop: 100,
    padding: 30
  },

  action: {
    textAlign: "center",
    marginTop: 30
  }
};

// JWTを保持していない場合のみログイン画面を表示する
// 保持している場合はstoreに認証情報をdispachする
class LoginContainer extends Component {
  componentWillMount() {
    if (!this.props.session.login) this.userWillTransfer();
  }

  componentWillUpdate(nextProps) {
    if (!nextProps.session.login) this.userWillTransfer();
  }

  userWillTransfer() {
    localStorage.setItem("tenant_name", this.props.match.params.tenant_name);
    const token = localStorage.getItem("token");

    if (token) {
      this.props.requestVerifyToken(token);
    }
  }

  login = () => {
    const account_name = this.refs.account_name.getValue();
    const password = this.refs.password.getValue();
    this.props.requestLogin(account_name, password);
  };

  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      this.login();
    }
    return false;
  };

  render() {
    return (
      this.props.session.login ? (
        <Redirect to={`/home/${this.props.tenant.dirId}`} />
      ) : (
        <div>
          <AppBar title="cloud storage" />

          <div style={styles.wrapper}>
            <Card style={styles.card}>
              <CardTitle title={"Login"} />

              <CardText>

                <TextField
                  ref="account_name"
                  onKeyDown={this.handleKeyDown}
                  hintText="example"
                  floatingLabelText="ユーザID"
                  errorText={this.props.session.errors.account_name}
                  style={styles.text} />

                <br />

                <TextField
                  ref="password"
                  onKeyDown={this.handleKeyDown}
                  floatingLabelText="パスワード"
                  errorText={this.props.session.errors.password}
                  style={styles.text}
                  type="password" />

              </CardText>

              <CardActions style={styles.action}>
                <RaisedButton label="login" onTouchTap={this.login} />
              </CardActions>

            </Card>
          </div>

        </div>
      )
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    session: state.session,
    tenant: state.tenant
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  requestLogin: (name, password) => dispatch(actions.requestLogin(name, password)),
  requestLoginSuccess: (message, user_id) => {
    dispatch(actions.requestLoginSuccess(message, user_id));
  },
  requestVerifyToken: (token) => {
    dispatch(actions.requestVerifyToken(token));
  },
  putTenant: (name, dirId, trashDirId, trashIconVisibility) => {
    dispatch(actions.putTenant(name, dirId, trashDirId, trashIconVisibility));
  }
});

LoginContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer);

export default LoginContainer;
