import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import * as UsersActions from '../actions/UserList';
import * as UserFormActions from '../actions/UserForm';
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

    const handleSubmit = (form) => (event) => this.props.handleSubmit(form, event);
    const handleChange = (name) => (event) => this.props.handleChange(name, event);

    return (
      <div>
        <Helmet title="Home" />
        <h4>New user</h4>
        <form onSubmit={handleSubmit(form)}>
          <input
            size="25"
            name="login"
            value={form.login || ''}
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

    handleChange: (name, event) => {
      dispatch({ type: UserFormActions.USER_FORM_CHANGE, name, value: event.target.value })
    },

    handleSubmit: (form, event) => {
      event.preventDefault();

      UserFormActions.submitUser(dispatch, form);
    }
  }
}

function mapStateToProps(state) {
  return {
    users: state.users,
    userForm: state.userForm
  };
}

Home.propTypes = {
  users: PropTypes.object.isRequired,
  userForm: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
