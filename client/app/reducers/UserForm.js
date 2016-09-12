import {
  USER_FORM_CHANGE,
  USER_FORM_SUBMITING,
  USER_FORM_SUBMITED,
  USER_FORM_SUBMIT_FAILED
} from '../actions/user';

export default function user(state = {
  fields: {},
  errors: {},
  readyState: USER_FORM_SUBMITED
}, action) {
  switch (action.type) {
    case USER_FORM_CHANGE:
      return Object.assign({}, state, {
        fields: {
          [action.name]: action.value
        }
      });
    case USER_FORM_SUBMITING:
      return Object.assign({}, state, {
        readyState: USER_FORM_SUBMITING
      });
    case USER_FORM_SUBMIT_FAILED:
      return Object.assign({}, state, {
        readyState: USER_FORM_SUBMIT_FAILED,
        errors: action.result.errors
      });
    case USER_FORM_SUBMITED:
      return Object.assign({}, state, {
        readyState: USER_FORM_SUBMITED,
        fields: {},
        errors: {}
      });
    default:
      return state;
  }
}
