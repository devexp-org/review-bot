import React from 'react';
import { Route } from 'react-router';
import App from './containers/App';
import User from './containers/User';
import UserList from './containers/UserList';
import NoMatch from './containers/NoMatch';

export default (
  <Route component={App}>
    <Route path="/" component={UserList} />
    <Route path="user/:id" component={User} />
    <Route path="*" component={NoMatch} />
  </Route>
);
