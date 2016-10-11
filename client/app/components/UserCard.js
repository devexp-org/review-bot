import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as UserActions from '../actions/user';
import * as UserFormActions from '../actions/userForm';

class UserCard extends Component {

  renderUserForm() {
    const form = this.props.userForm;

    const contacts = form.values.contacts || [];
    const isSubmiting = form.readyState === UserFormActions.USER_FORM_SUBMITING;

    const handleSubmit = (form) => (event) => this.props.handleSubmit(event, form);
    const handleChange = (name, index) => (event) => this.props.handleChange(event, name, index);

    return (
      <form onSubmit={handleSubmit(form)}>
        {
          contacts.map((contact, index) => {
            return (
              <div>
                <select value={contact.id} onChange={handleChange('id', index)}>
                  <option value="email">email</option>
                  <option values="jabber">jabber</option>
                </select>
                {' '}
                <input
                  size="25"
                  name="email"
                  onChange={handleChange('account', index)}
                  value={contact.account || ''}
                />
              </div>
            );
          })
        }
        <div>
          <button type="button" onClick={this.props.handleAddContact}>
            Add contact
          </button>
        </div>

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

    handleChange: (event, name, index) => {
      const value = event.target.value;
      dispatch({
        type: UserFormActions.USER_FORM_CHANGE_CONTACT,
        name,
        index,
        value
      })
    },

    handleSubmit: (event, form) => {
      event.preventDefault();
      dispatch(UserFormActions.submitUser(form.values));
    },

    handleAddContact: () => {
      dispatch({ type: UserFormActions.USER_FORM_ADD_CONTACT });
    }
  }
}

function mapStateToProps(state) {
  return {
    userForm: state.userForm
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
