import React, { Component } from 'react';

// router
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// app components
import AuthenticationContainer from "./AuthenticationContainer";
import HomeContainer from "./HomeContainer";
import FileDetailContainer from "./FileDetailContainer";
import FileSearchResultContainer from "./FileSearchResultContainer";
import LoginContainer from "./LoginContainer";
import NotifyStatusContainer from "./NotifyStatusContainer";
import UserContainer from "./UserContainer";
import UserDetailContainer from "./UserDetailContainer";
import UserCreateContainer from "./UserCreateContainer";
import GroupContainer from "./GroupContainer";
import GroupDetailContainer from "./GroupDetailContainer";
import GroupCreateContainer from "./GroupCreateContainer";
import RoleContainer from "./RoleContainer";
import RoleDetailContainer from "./RoleDetailContainer";
import RoleCreateContainer from "./RoleCreateContainer";
import TagContainer from "./TagContainer";
import TagCreateContainer from "./TagCreateContainer";
import TagDetailContainer from "./TagDetailContainer";
import AnalysisContainer from "./AnalysisContainer";
import AnalysisPeriodContainer from "./AnalysisPeriodContainer";
import MetaInfoContainer from "./MetaInfoContainer";
import MetaInfoDetailContainer from "./MetaInfoDetailContainer";
import MetaInfoCreateContainer from "./MetaInfoCreateContainer";
import RoleMenuContainer from "./RoleMenuContainer";
import RoleMenuDetailContainer from "./RoleMenuDetailContainer";
import RoleMenuCreateContainer from "./RoleMenuCreateContainer";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <NotifyStatusContainer>
            <Switch>
              <Route exact path="/:tenant_name/login" component={LoginContainer} />
              <AuthenticationContainer>
                <Switch>
                  <Route exact path="/users" component={UserContainer} />
                  <Route exact path="/users/create" component={UserCreateContainer} />
                  <Route path="/users/:id" component={UserDetailContainer} />
                  <Route exact path="/groups" component={GroupContainer} />
                  <Route exact path="/groups/create" component={GroupCreateContainer} />
                  <Route path="/groups/:id" component={GroupDetailContainer} />
                  <Route exact path="/tags" component={TagContainer} />
                  <Route exact path="/tags/create" component={TagCreateContainer} />
                  <Route path="/tags/:id" component={TagDetailContainer} />
                  <Route exact path="/files/search" component={FileSearchResultContainer} />
                  <Route path="/files/:id" component={FileDetailContainer} />
                  <Route exact path="/home" component={HomeContainer} />
                  <Route path="/home/:id" component={HomeContainer} />
                  <Route exact path="/role_files" component={RoleContainer} />
                  <Route exact path="/role_files/create" component={RoleCreateContainer} />
                  <Route path="/role_files/:id" component={RoleDetailContainer} />
                  <Route exact path="/analysis" component={AnalysisContainer} />
                  <Route exact path="/analysis/periods" component={AnalysisPeriodContainer} />
                  <Route exact path="/meta_infos" component={MetaInfoContainer} />
                  <Route
                    exact path="/meta_infos/create"
                    component={MetaInfoCreateContainer}
                  />
                  <Route
                    path="/meta_infos/:id"
                    component={MetaInfoDetailContainer}
                  />
                  <Route exact path="/role_menus" component={RoleMenuContainer} />
                  <Route exact path="/role_menus/create" component={RoleMenuCreateContainer} />
                  <Route path="/role_menus/:id" component={RoleMenuDetailContainer} />
                  <Route component={HomeContainer} />
                </Switch>
              </AuthenticationContainer>
            </Switch>
          </NotifyStatusContainer>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
