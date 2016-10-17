import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const UserList = (props) => {

  const onDelete = (login) => (event) => props.onDelete(event, login);

  return (
    <ul>
      {
        props.items.map(user => {
          return (
            <li key={user._id}>
              <Link to={'user/' + user.login}>{user.login}</Link>
              {' – '}
              <span onClick={onDelete(user.login)}>[✕]</span>
            </li>
          );
        })
      }
    </ul>
  );

};

UserList.propTypes = {
  items: PropTypes.array.isRequired
};

export default UserList;
