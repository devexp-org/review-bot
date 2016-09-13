import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import UserList from '../components/UserList';
import * as UserActions from '../actions/user';
import * as UserFormActions from '../actions/userForm';
import * as UserListActions from '../actions/userList';

class UserListContainer extends Component {

  static readyOnActions(dispatch) {
    return dispatch(UserListActions.fetchUserList());
  }

  componentDidMount() {
    if (this.props.userList.readyState === UserListActions.USER_LIST_INVALID) {
      this.constructor.readyOnActions(this.props.dispatch);
    }
  }

  componentWillUnmount() {
    UserListActions.freeUserList();
  }

  renderUserList() {
    const userList = this.props.userList;

    if (userList.readyState === UserListActions.USER_LIST_INVALID ||
      userList.readyState === UserListActions.USER_LIST_FETCHING) {
      return (<p>Loading...</p>);
    }

    if (userList.readyState === UserListActions.USER_LIST_FETCH_FAILED) {
      return (<p>Failed to fetch userList</p>);
    }

    return (<UserList userList={userList.list} onDelete={this.props.handleDelete} />);
  }

  renderUserForm() {
    const form = this.props.userForm;

    const isSubmiting = form.readyState === UserFormActions.USER_FORM_SUBMITING;

    const handleSubmit = (form) => (event) => this.props.handleSubmit(event, form);
    const handleChange = (name) => (event) => this.props.handleChange(event, name);

    return (
      <form onSubmit={handleSubmit(form)}>
        <input
          size="25"
          name="login"
          value={form.values.login || ''}
          onChange={handleChange('login')}
          autoComplete="off"
        />
        {form.errors.login ? (<div>{form.errors.login.message}</div>) : ''}
        <div><button type="submit" disabled={isSubmiting}>Add</button></div>
      </form>
    );
  }

  render() {
    return (
      <div>
        <h4>New user</h4>
        {this.renderUserForm()}
        <h5>Users:</h5>
        {this.renderUserList()}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,

    handleChange: (event, name) => {
      const value = event.target.value;
      dispatch({ type: UserFormActions.USER_FORM_CHANGE, name, value })
    },

    handleSubmit: (event, form) => {
      event.preventDefault();
      dispatch(UserFormActions.submitUser(form.values));
    },

    handleDelete: (event, userId) => {
      event.preventDefault();
      dispatch(UserActions.deleteUser(userId));
    }
  }
}

function mapStateToProps(state) {
  return {
    userList: state.userList,
    userForm: state.userForm
  };
}

UserListContainer.propTypes = {
  userList: PropTypes.object.isRequired,
  userForm: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(UserListContainer);
