import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';

class UserList extends Component {

  render() {
    return (
      <ul>
        {this.props.users.map((user) => {
          return (
            <li key={user._id}>
              <Link to={'user/' + user.login}>{user.login}</Link>
            </li>
          );
        })}
      </ul>
    );
  }
}

UserList.propTypes = {
  users: PropTypes.array.isRequired
};

export default UserList;
