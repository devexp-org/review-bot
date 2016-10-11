import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as UserActions from '../actions/user';
import * as UserFormActions from '../actions/userForm';

class UserCard extends Component {

  renderUserForm() {
    const form = this.props.userForm;

    const isSubmiting = form.readyState === UserFormActions.USER_FORM_SUBMITING;

    const handleSubmit = (form) => (event) => this.props.handleSubmit(event, form);
    const handleChange = (name) => (event) => this.props.handleChange(event, name);

    return (
      <form onSubmit={handleSubmit(form)}>
        <input
          size="25"
          name="email"
          value={form.values.email || ''}
          onChange={handleChange('email')}
          autoComplete="off"
        />
        {form.errors.email ? (<div>{form.errors.login.message}</div>) : ''}
        <br />
        <input
          size="25"
          name="jabber"
          value={form.values.jabber || ''}
          onChange={handleChange('jabber')}
          autoComplete="off"
        />
        {form.errors.jabber ? (<div>{form.errors.jabber.message}</div>) : ''}

        <div><button type="submit" disabled={isSubmiting}>Save</button></div>
      </form>
    );
  }

  render() {
    const user = this.props.user;

    return (
      <div>
        <ul>
          <li>Name: {user.login}</li>
        </ul>
        {this.renderUserForm()}
      </div>
    );
  }
}

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  userForm: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

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
    }
  }
}

function mapStateToProps(state) {
  return {
    userForm: state.userForm
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
