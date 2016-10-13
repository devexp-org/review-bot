import * as UserFormActions from '../actions/userForm';

export default function user(state = {
  values: {},
  errors: {},
  readyState: UserFormActions.USER_FORM_READY
}, action) {
  let values, contacts;

  switch (action.type) {
    case UserFormActions.USER_EDIT:
      return Object.assign({}, state, {
        values: action.user
      });
    case UserFormActions.USER_FORM_CHANGE:
      return Object.assign({}, state, {
        values: { [action.name]: action.value }
      });
    case UserFormActions.USER_FORM_SUBMITING:
      return Object.assign({}, state, {
        readyState: UserFormActions.USER_FORM_SUBMITING
      });
    case UserFormActions.USER_FORM_SUBMITED:
      if (action.status === 422) {
        return Object.assign({}, state, {
          errors: action.result.errors,
          readyState: UserFormActions.USER_FORM_ERROR
        });
      } else {
        return Object.assign({}, state, {
          values: {},
          errors: {},
          readyState: UserFormActions.USER_FORM_READY
        });
      }
    case UserFormActions.USER_FORM_SUBMIT_FAILED:
      return Object.assign({}, state, {
        readyState: UserFormActions.USER_FORM_SUBMIT_FAILED
      });
    case UserFormActions.USER_FORM_ADD_CONTACT:
      contacts = (state.values.contacts || []).slice();
      contacts.push({ id: 'email', account: '' });

      values = Object.assign({}, state.values, { contacts });

      return Object.assign({}, state, { values });
    case UserFormActions.USER_FORM_CHANGE_CONTACT:
      contacts = (state.values.contacts || []).slice();
      contacts[action.index][action.name] = action.value;

      values = Object.assign({}, state.values, { contacts });

      return Object.assign({}, state, { values });
    default:
      return state;
  }
}
