import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import * as UserActions from '../actions/user';
import * as UserFormActions from '../actions/userForm';
import * as UserListActions from '../actions/userList';

import './Home.css';

class Home extends Component {

  render() {
    return (
      <div>
        <Helmet title="Home" />
        {this.props.children}
      </div>
    );
  }

}

export default Home;
