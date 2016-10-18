import join from 'url-join';
import config from '../config';
import { fetchUserListSilent } from './userList';
import { handleSubmitResponse } from './utils';

import * as contacts from './contactList';

export const USER_FORM_EDIT = 'USER_FORM_EDIT';

export const USER_FORM_READY = 'USER_FORM_READY';
export const USER_FORM_ERROR = 'USER_FORM_ERROR';
export const USER_FORM_CHANGE = 'USER_FORM_CHANGE';

export const USER_FORM_SUBMITED = 'USER_FORM_SUBMITED';
export const USER_FORM_SUBMITING = 'USER_FORM_SUBMITING';
export const USER_FORM_SUBMIT_FAILED = 'USER_FORM_SUBMIT_FAILED';

export const USER_FORM_UPDATED = 'USER_FORM_UPDATED';
export const USER_FORM_UPDATING = 'USER_FORM_UPDATING';
export const USER_FORM_UPDATE_FAILED = 'USER_FORM_UPDATE_FAILED';

export const ENDPOINT = join(config.api.prefix, 'users');


export function editUser(user) {
  return (dispatch) => {
    dispatch({ type: USER_FORM_EDIT, user });
  }
}

export function submitUser(form) {
  return (dispatch) => {
    dispatch({ type: USER_FORM_SUBMITING });

    return fetch(ENDPOINT, {
        body: JSON.stringify(form),
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(handleSubmitResponse(null, dispatch, USER_FORM_SUBMITED, USER_FORM_SUBMIT_FAILED))
      .then(() => dispatch(fetchUserListSilent()));
  };
}

export function updateUser(id, form) {
  return (dispatch) => {
    dispatch({ type: USER_FORM_UPDATING });

    return fetch(join(ENDPOINT, id), {
        body: JSON.stringify(form),
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(handleSubmitResponse(id, dispatch, USER_FORM_UPDATED, USER_FORM_UPDATE_FAILED));
  };
}

const INITIAL_STATE = {
  error: '',
  values: {},
  errors: {},
  readyState: USER_FORM_READY
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case USER_FORM_EDIT:
      return Object.assign({}, state, {
        error: '',
        values: action.user,
        errors: {},
        readyState: USER_FORM_READY
      });

    case USER_FORM_CHANGE:
      return Object.assign({}, state, {
        values: Object.assign({}, state.values, {
          [action.name]: action.value
        })
      });

    case USER_FORM_UPDATING:
    case USER_FORM_SUBMITING:
      return Object.assign({}, state, {
        error: '',
        readyState: action.type
      });

    case USER_FORM_UPDATE_FAILED:
    case USER_FORM_SUBMIT_FAILED:
      return Object.assign({}, state, {
        error: action.reason,
        errors: action.errors,
        readyState: action.type
      });

    case USER_FORM_UPDATED:
      return Object.assign({}, state, {
        readyState: USER_FORM_READY
      });

    case USER_FORM_SUBMITED:
      return INITIAL_STATE;

    case contacts.USER_ADD_CONTACT:
    case contacts.USER_DELETE_CONTACT:
    case contacts.USER_CHANGE_CONTACT:
      return Object.assign({}, state, {
        values: Object.assign({}, state.values, {
          contacts: contacts.reducer(state.values.contacts, action)
        })
      });

    default:
      return state;

  }
}
