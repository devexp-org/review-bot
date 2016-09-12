import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import UserCard from '../components/UserCard';
import * as UserActions from '../actions/user';

class User extends Component {

  static readyOnActions(dispatch, params) {
    return Promise.all([
      dispatch(UserActions.fetchUserInfo(params.id))
    ]);
  }

  componentDidMount() {
    User.readyOnActions(this.props.dispatch, this.props.params);
  }

  getUser() {
    return this.props.userInfo[this.props.params.id];
  }

  renderUser() {
    const user = this.getUser();

    if (!user || user.readyState === UserActions.USER_INFO_FETCHING) {
      return <p>Loading...</p>;
    }

    if (user.readyState === UserActions.USER_INFO_FETCH_FAILED) {
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
