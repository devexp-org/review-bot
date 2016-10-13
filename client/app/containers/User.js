import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import UserCard from '../components/UserCard';
import * as UserActions from '../actions/user';

class User extends Component {

  static readyOnActions(dispatch, params) {
    return dispatch(UserActions.fetchUser(params.id));
  }

  componentDidMount() {
    console.info('did mount');
    if (!this.getUser()) {
      User.readyOnActions(this.props.dispatch, this.props.params);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(UserActions.freeUser(this.props.params.id));
  }

  getUser() {
    return this.props.userInfo[this.props.params.id];
  }

  renderUser() {
    const user = this.getUser();

    if (!user || user.readyState === UserActions.USER_FETCHING) {
      return <p>Loading...</p>;
    }

    if (user.readyState === UserActions.USER_FETCH_FAILED) {
      return <p>Failed to fetch user</p>;
    }

    return <UserCard user={user.info} />;
  }

  render() {
    return (
      <div>
        <Helmet title={this.getUser() ? this.getUser().name : ''} />
        {this.renderUser()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

User.propTypes = {
  params: PropTypes.object.isRequired,
  userInfo: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(User);
