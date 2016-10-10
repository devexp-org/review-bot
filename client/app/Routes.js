import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import App from './containers/App';
import User from './containers/User';
import Home from './containers/Home';
import UserList from './containers/UserList';
import NoMatch from './containers/NoMatch';

export default (
  <Route component={App}>
    <Route path="/" component={Home}>
      <IndexRedirect to="users" />
      <Route path="users" component={UserList} />
    </Route>
    <Route path="user/:id" component={User} />
    <Route path="*" component={NoMatch} />
  </Route>
);
