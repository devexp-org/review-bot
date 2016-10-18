import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import UserCardComponent from '../../components/UserCard/';
import * as UserActions from '../../actions/userInfo';

class UserCard extends Component {

  static readyOnActions(dispatch, params) {
    return dispatch(UserActions.fetchUser(params.id));
  }

  componentDidMount() {
    if (this.props.userInfo.readyState === UserActions.USER_READY) {
      this.constructor.readyOnActions(this.props.dispatch, this.props.params);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(UserActions.freeUser(this.props.params.id));
  }

  render() {
    const user = this.props.userInfo;

    if (
      user.readyState === UserActions.USER_READY ||
      user.readyState === UserActions.USER_FETCHING
    ) {
      return <p>Loading...</p>;
    }

    if (user.readyState === UserActions.USER_FETCH_FAILED) {
      return <p>Failed to fetch user</p>;
    }

    return (
      <div>
        <Helmet title={user.name || ''} />
        <UserCardComponent id={this.props.params.id} user={user} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userInfo: state.userInfo
  };
}

UserCard.propTypes = {
  params: PropTypes.object.isRequired,
  userInfo: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(UserCard);
