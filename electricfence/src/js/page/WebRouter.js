/*
  WebRouter zhuyu  2018/11/7
 */

import React, {
  Component
} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";
import {
  Provider
} from 'mobx-react';

import LoginPage from './LoginPage';
import CommonMenu from './CommonMenu';
import stores from '../../store/AllStore';


class WebRouter extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    // console.log(stores);
    return (
      <Provider { ...stores }>
        <Router>
          <div >
            <Switch>
              <Route
                exact
                path = "/"
                component = { LoginPage }
              />
              <Route
                path = "/CommonMenu"
                component = { CommonMenu }
              />
            </Switch>
          </div>
        </Router>
      </Provider>

    );
  }

}

export default WebRouter;
