import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import * as UserFormActions from '../../actions/userForm';

class UserAddForm extends Component {

  render() {
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

}

function mapDispatchToProps(dispatch) {
  return {
    handleChange: (event, name) => {
      const value = event.target.value;
      dispatch({ type: UserFormActions.USER_FORM_CHANGE, name, value });
    },

    handleSubmit: (event, form) => {
      event.preventDefault();
      dispatch(UserFormActions.submitUser(form.values));
    }
  };
}

function mapStateToProps(state) {
  return {
    userForm: state.userForm
  };
}

UserAddForm.propTypes = {
  userForm: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAddForm);
