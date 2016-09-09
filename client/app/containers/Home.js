import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import * as UsersActions from '../actions/users';
import * as UserFormActions from '../actions/user-form';
import UserList from '../components/UserList';

// @connect(state => { users: state.users })
class Home extends Component {

  static readyOnActions(dispatch) {
    return Promise.all([
      dispatch(UsersActions.fetchUsersIfNeeded())
    ]);
  }

  componentDidMount() {
    Home.readyOnActions(this.props.dispatch);
  }

  renderUsers() {
    const users = this.props.users;

    if (users.readyState === UsersActions.USERS_INVALID ||
      users.readyState === UsersActions.USERS_FETCHING) {
      return <p>Loading...</p>;
    }

    if (users.readyState === UsersActions.USERS_FETCH_FAILED) {
      return <p>Failed to fetch users</p>;
    }

    return <UserList users={users.list} />;
  }

  render() {
    var form = this.props.userForm;
    const handleChange = (name) => (event) => this.props.handleChange(name, event);

    return (
      <div>
        <Helmet title="Home" />
        <h4>New user</h4>
        <form onSubmit={this.props.handleSubmit}>
          <input
            size="25"
            name="login"
            value={form.login && form.login.value || ''}
            onChange={handleChange('login')}
          />
          <button type="submit">Add</button>
        </form>
        <h5>Users:</h5>
        {this.renderUsers()}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,

    handleChange: (field, event) => {
      dispatch({ type: USER_FORM_CHANGE, field, value: event.target.value })
    },

    handleSubmit: (event) => {
      event.preventDefault();
      dispatch({ type: UserFormActions.USER_FORM_SUBMIT, form })
    }
  }
}

function mapStateToProps(state) {
  return {
    userForm: state.userForm,
    users: state.users
  };
}

Home.propTypes = {
  users: PropTypes.object.isRequired,
  userForm: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
