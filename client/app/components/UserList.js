import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const UserList = (props) => {
  const userList = props.userList;

  const onDelete = (userId) => (event) => props.onDelete(event, userId);

  return (
    <ul>
      {userList.map((user) => {
        return (
          <li key={user._id}>
            <Link to={'user/' + user.login}>{user.login}</Link>
            {' – '}
            <span onClick={onDelete(user.login)}>[x]</span>
          </li>
        );
      })}
    </ul>
  );
};

UserList.propTypes = {
  userList: PropTypes.array.isRequired
};

export default UserList;
