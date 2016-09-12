import React, { PropTypes } from 'react';

const UserCard = (props) => {
  const user = props.user;

  return (
    <ul>
      <li>Name: {user.login}</li>
    </ul>
  );
}

UserCard.propTypes = {
  user: PropTypes.object.isRequired
};

export default UserCard;
