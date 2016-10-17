import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import UserAddForm from '../../containers/UserAddForm';
import UserListComponent from '../../components/UserList';

import * as UserInfoActions from '../../actions/userInfo';
import * as UserListActions from '../../actions/userList';

class UserList extends Component {

  static readyOnActions(dispatch) {
    return dispatch(UserListActions.fetchUserList());
  }

  componentDidMount() {
    if (this.props.userList.readyState !== UserListActions.USER_LIST_FETCHED) {
      this.constructor.readyOnActions(this.props.dispatch);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(UserListActions.freeUserList());
  }

  renderUserList() {
  }

  render() {
    const userList = this.props.userList;

    if (
      userList.readyState === UserListActions.USER_LIST_READY ||
      userList.readyState === UserListActions.USER_LIST_FETCHING
    ) {
      return (<p>Loading...</p>);
    }

    if (userList.readyState === UserListActions.USER_LIST_FETCH_FAILED) {
      return (<p>Failed to fetch users</p>);
    }

    return (
      <div>
        <h4>New user</h4>
        <UserAddForm />
        <h5>Users:</h5>
        <UserListComponent items={userList.items} onDelete={this.props.handleDelete} />
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,

    handleDelete: (event, userId) => {
      event.preventDefault();
      dispatch(UserListActions.deleteUser(userId));
    }
  }
}

function mapStateToProps(state) {
  return {
    userList: state.userList
  };
}

UserList.propTypes = {
  userList: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
