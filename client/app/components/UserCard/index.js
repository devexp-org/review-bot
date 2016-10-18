import join from 'url-join';
import { withRouter } from 'react-router'
import React, { Component, PropTypes } from 'react';

class UserCard extends Component {

  render() {
    const user = this.props.user;
    const contacts = user.contacts || [];

    const handleEdit = () => {
      this.props.router.push(join('/user', user.login, 'edit'));
    };

    return (
      <div>
        <ul>
          <li>Name: {user.login}</li>
        </ul>
        <ul>
          {
            contacts.map(item => {
              return (
                <li>{item.id} &mdash; {item.account}</li>
              );
            })
          }
        </ul>
        <button type="button" onClick={handleEdit}>Edit</button>
      </div>
    );
  }
}

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired
  }).isRequired
};

export default withRouter(UserCard);
