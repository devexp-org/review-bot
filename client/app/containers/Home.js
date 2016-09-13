import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import UserList from '../containers/UserList';
import * as UserActions from '../actions/user';
import * as UserFormActions from '../actions/userForm';
import * as UserListActions from '../actions/userList';

class Home extends Component {

  render() {
    return (
      <div>
        <Helmet title="Home" />
        <UserList />
      </div>
    );
  }

}
