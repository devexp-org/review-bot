import join from 'url-join';
import config from '../config';
import { handleFetchResponse } from './utils';

export const USER_LIST_READY        = 'USER_LIST_READY';

export const USER_LIST_FETCHED      = 'USER_LIST_FETCHED';
export const USER_LIST_FETCHING     = 'USER_LIST_FETCHING';
export const USER_LIST_FETCH_FAILED = 'USER_LIST_FETCH_FAILED';

export const USER_DELETED           = 'USER_DELETED';
export const USER_DELETING          = 'USER_DELETING';
export const USER_DELETE_FAILED     = 'USER_DELETE_FAILED';

export const ENDPOINT = join(config.api.prefix, 'users');

export function freeUserList() {
  return { type: USER_LIST_READY };
}

export function fetchUserList() {
  return (dispatch) => {
    dispatch({ type: USER_LIST_FETCHING });

    return fetch(ENDPOINT)
      .then(handleFetchResponse(null, dispatch, USER_LIST_FETCHED, USER_LIST_FETCH_FAILED));
  };
}

export function fetchUserListSilent() {
  return (dispatch) => {
    return fetch(ENDPOINT)
      .then(handleFetchResponse(null, dispatch, USER_LIST_FETCHED, USER_LIST_FETCH_FAILED));
  };
}

export function deleteUser(userId) {
  return (dispatch) => {
    dispatch({ type: USER_DELETING, id: userId });

    return fetch(join(ENDPOINT, userId), { method: 'DELETE' })
      .then(handleFetchResponse(userId, dispatch, USER_DELETED, USER_DELETE_FAILED));
  };
}

export const INITIAL_STATE = {
  readyState: USER_LIST_READY
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case USER_LIST_READY:
      return INITIAL_STATE;

    case USER_LIST_FETCHED:
      return Object.assign({}, state, {
        items: action.data,
        readyState: USER_LIST_FETCHED
      });

    case USER_LIST_FETCHING:
      return Object.assign({}, state, {
        readyState: USER_LIST_FETCHING
      });

    case USER_LIST_FETCH_FAILED:
      return Object.assign({}, state, {
        readyState: USER_LIST_FETCH_FAILED
      });

    case USER_DELETED:
      if (state.readyState === USER_LIST_FETCHED) {
        return Object.assign({}, state, {
          items: state.items.filter(user => user.login !== action.id)
        });
      }
      return state;

    default:
      return state;

  }
}
