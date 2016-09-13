import * as UserFormActions from '../actions/userForm';

export default function user(state = {
  values: {},
  errors: {},
  readyState: UserFormActions.USER_FORM_READY
}, action) {
  switch (action.type) {
    case UserFormActions.USER_FORM_CHANGE:
      return Object.assign({}, state, {
        values: {
          [action.name]: action.value
        }
      });
    case UserFormActions.USER_FORM_SUBMITING:
      return Object.assign({}, state, {
        readyState: UserFormActions.USER_FORM_SUBMITING
      });
    case UserFormActions.USER_FORM_SUBMIT_FAILED:
      return Object.assign({}, state, {
        readyState: UserFormActions.USER_FORM_SUBMIT_FAILED
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
    default:
      return state;
  }
}
