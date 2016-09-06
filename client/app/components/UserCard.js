import React, { PropTypes, Component } from 'react';

class UserCard extends Component {

  render() {
    const user = this.props.user;

    return (
      <ul>
        <li>Name: {user.login}</li>
      </ul>
    );
  }
}

UserCard.propTypes = {
  user: PropTypes.object.isRequired
};

export default UserCard;
