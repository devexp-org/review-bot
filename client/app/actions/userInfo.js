import join from 'url-join';
import config from '../config';
import { handleFetchResponse } from './utils';

export const USER_READY         = 'USER_READY';

export const USER_FETCHED       = 'USER_FETCHED';
export const USER_FETCHING      = 'USER_FETCHING';
export const USER_FETCH_FAILED  = 'USER_FETCH_FAILED';

export const ENDPOINT = join(config.api.prefix, 'users');

export function freeUser(userId) {
  return { type: USER_READY };
}

export function fetchUser(userId) {
  return (dispatch) => {
    dispatch({ type: USER_FETCHING, id: userId });

    return fetch(join(ENDPOINT, userId))
      .then(handleFetchResponse(userId, dispatch, USER_FETCHED, USER_FETCH_FAILED))
  };
}

export const INITIAL_STATE = {
  readyState: USER_READY
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case USER_READY:
      return INITIAL_STATE;

    case USER_FETCHED:
      return Object.assign({}, state, action.data, {
        readyState: USER_FETCHED
      });

    case USER_FETCHING:
      return Object.assign({}, state, {
        readyState: USER_FETCHING
      });

    case USER_FETCH_FAILED:
      return Object.assign({}, state, {
        readyState: USER_FETCH_FAILED
      });

    default:
      return state;

  }
}
