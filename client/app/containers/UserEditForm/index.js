import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import * as UserActions from '../../actions/userInfo';
import * as UserFormActions from '../../actions/userForm';

class UserEditForm extends Component {

  static readyOnActions(dispatch, params) {
    return dispatch(UserActions.fetchUser(params.id));
  }

  componentDidMount() {
    if (this.props.userInfo.readyState === UserActions.USER_READY) {
      this.constructor.readyOnActions(this.props.dispatch, this.props.params);
    }

    if (this.props.userInfo.readyState === UserActions.USER_FETCHED) {
      this.props.dispatch(UserFormActions.editUser(this.props.userInfo));
    }
  }

  componentWillUnmount() {
    this.props.dispatch(UserActions.freeUser(this.props.params.id));
  }

  render() {
    const form = this.props.userForm;
    const login = this.props.params.id;
    const contacts = form.values.contacts || [];

    const isUpdating = form.readyState === UserFormActions.USER_FORM_UPDATING;

    const handleSubmit = (event) => this.props.handleSubmit(event, login, form);
    const handleChange = (name, index) => (event) => this.props.handleChange(event, name, index);
    const handleDeleteContact = (index) => (event) => this.props.handleDeleteContact(event, index);

    return (
      <form onSubmit={handleSubmit}>
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
                  name="account"
                  onChange={handleChange('account', index)}
                  value={contact.account || ''}
                />
                <button type="button" onClick={handleDeleteContact(index)}>
                  ✕
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

        <div><button type="submit" disabled={isUpdating}>Save</button></div>
      </form>
    );
  }
}

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
    userInfo: state.userInfo,
    userForm: state.userForm
  };
}

UserEditForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userInfo: PropTypes.object.isRequired,
  userForm: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(UserEditForm);
