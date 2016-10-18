import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as UserActions from '../../actions/userInfo';
import * as UserFormActions from '../../actions/userForm';

class UserCard extends Component {

  renderUserForm() {
    const form = this.props.userForm;
    const login = this.props.user.login;

    const contacts = form.values.contacts || [];
    const isSubmiting = form.readyState === UserFormActions.USER_FORM_SUBMITING;

    const handleSubmit = (form) => (event) => this.props.handleSubmit(login, event, form);
    const handleChange = (name, index) => (event) => this.props.handleChange(event, name, index);
    const handleDeleteContact = (index) => (event) => this.props.handleDeleteContact(event, index);

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
                <button type="button" onClick={handleDeleteContact(index)}>
                  X
                </button>
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

  renderUserContacts() {
    const contacts = this.props.user.contacts || [];
    const handleEdit = () => this.props.handleEdit(this.props.id);

    return (
      <div>
        <ul>
          {contacts.map(item => {
            return (
              <li>
                {item.id} &mdash; {item.account}
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={handleEdit}>Edit</button>
      </div>
    );
  }

  render() {
    const user = this.props.user;
    const form = user.readyState === UserActions.USER_EDIT;

    return (
      <div>
        <ul>
          <li>Name: {user.login}</li>
        </ul>
        {form ? this.renderUserForm() : this.renderUserContacts()}
      </div>
    );
  }
}

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  userForm: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch, props) {
  return {
    dispatch,

    handleEdit: (userId) => {
      dispatch({ type: UserFormActions.USER_EDIT, userId: props.id, user: props.user });
    },

    handleChange: (event, name, index) => {
      const value = event.target.value;
      dispatch({
        type: UserFormActions.USER_FORM_CHANGE_CONTACT,
        name,
        index,
        value
      })
    },

    handleSubmit: (login, event, form) => {
      event.preventDefault();
      dispatch(UserFormActions.updateUser(login, form.values));
    },

    handleAddContact: () => {
      dispatch({ type: UserFormActions.USER_FORM_ADD_CONTACT });
    },

    handleDeleteContact: (event, index) => {
      dispatch({ type: UserFormActions.USER_FORM_DELETE_CONTACT, index });
    }
  }
}

function mapStateToProps(state) {
  return {
    userForm: state.userForm
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
