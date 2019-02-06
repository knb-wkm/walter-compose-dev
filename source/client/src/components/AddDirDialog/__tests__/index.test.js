import React from "react";
import ReactDOM from "react-dom";

import { shallow, mount, render } from "enzyme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import injectTapEventPlugin from "react-tap-event-plugin";

import AddDirDialog from "../index";

import MenuItem from "material-ui/MenuItem";

import {
  toggleAddDir,  
  createDir,
  triggerSnackbar
} from "../../../actions";

import sinon from "sinon";

injectTapEventPlugin();

describe("AddDirDialog", () => {

  it("without crashing", () => {
    const div = document.createElement("div");

    ReactDOM.render(
      <MuiThemeProvider>
        <AddDirDialog
          dir_id={0}
          toggleAddDir={() => console.log("")}
          createDir={() => console.log("")}
          open={false}
          allDirs={[]}
          triggerSnackbar={() => console.log("")} />
      </MuiThemeProvider>,
      div
    );

  });

});

describe("material-ui test", () => {
  // const muiTheme = getMuiTheme();
  // const shallowWithContext = (node) => shallow(node, {context: {muiTheme}});

  // const testChildren = <div className="unique">Hello World</div>;

  it('renders children by default', () => {
    // const muiTheme = getMuiTheme();

    // const shallowWithContext = (node) => {
    //   mount(
    //     node,
    //     {
    //       context: {muiTheme}
    //     }
    //   );
    // };

    // const testChildren = <div className="unique">Hello World</div>;

    // const wrapper = shallowWithContext(
    //   <div>
    //     <AddDirDialog
    //       dir_id={0}
    //       toggleAddDir={() => true}
    //       createDir={() => true}
    //       open={true}
    //       triggerSnackbar={() => true} />
    //   </div>
    // );

    // assert.ok(wrapper.contains(testChildren), 'should contain the children');
  });
  
});
