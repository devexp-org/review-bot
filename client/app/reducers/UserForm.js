import {
  USER_FORM_CHANGE,
  USER_FORM_SUBMIT
} from '../actions/UserForm';

export default function user(state = {}, action) {
  switch (action.type) {
    case USER_FORM_CHANGE:
      return Object.assign({}, state, {
        [action.name]: action.value
      });
    default:
      return state;
  }
}
