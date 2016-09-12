import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import UserList from '../components/UserList';
import * as UserActions from '../actions/user';

class Home extends Component {

  static readyOnActions(dispatch) {
    return Promise.all([
      dispatch(UserActions.fetchUserList())
    ]);
  }

  componentDidMount() {
    Home.readyOnActions(this.props.dispatch);
  }

  renderUserList() {
    const userList = this.props.userList;

    if (userList.readyState === UserActions.USER_LIST_FETCHING) {
      return <p>Loading...</p>;
    }

    if (userList.readyState === UserActions.USER_LIST_FETCH_FAILED) {
      return <p>Failed to fetch userList</p>;
    }

    return <UserList userList={userList.list} onDelete={this.props.handleDelete} />;
  }

  renderUserForm() {
    const form = this.props.userForm;

    const isSubmiting = form.readyState === UserActions.USER_FORM_SUBMITING;

    const handleSubmit = (form) => (event) => this.props.handleSubmit(event, form);
    const handleChange = (name) => (event) => this.props.handleChange(event, name);

    return (
      <form onSubmit={handleSubmit(form)}>
        <input
          size="25"
          name="login"
          value={form.fields.login || ''}
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
        <Helmet title="Home" />
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
      dispatch({ type: UserActions.USER_FORM_CHANGE, name, value })
    },

    handleSubmit: (event, form) => {
      event.preventDefault();
      dispatch(UserActions.submitUser(form.fields));
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

Home.propTypes = {
  userList: PropTypes.object.isRequired,
  userForm: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
