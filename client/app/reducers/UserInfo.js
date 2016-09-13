import {
  USER_INFO_FETCHING,
  USER_INFO_FETCHED,
  USER_INFO_FETCH_FAILED,
  USER_INFO_FREE
} from '../actions/user';

export default function user(state = {}, action) {
  switch (action.type) {
    case USER_INFO_FETCHING:
      return Object.assign({}, state, {
        [action.userId]: {
          readyState: USER_INFO_FETCHING
        }
      });
    case USER_INFO_FETCH_FAILED:
      return Object.assign({}, state, {
        [action.userId]: {
          readyState: USER_INFO_FETCH_FAILED,
          error: action.error
        }
      });
    case USER_INFO_FETCHED:
      return Object.assign({}, state, {
        [action.userId]: {
          readyState: USER_INFO_FETCHED,
          info: action.result
        }
      });
    case USER_INFO_FREE:
      return Object.assign({}, state, {
        [action.userId]: null
      });
    default:
      return state;
  }
}
