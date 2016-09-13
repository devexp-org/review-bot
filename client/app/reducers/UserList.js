import {
  USER_LIST_FETCHING,
  USER_LIST_FETCHED,
  USER_LIST_FETCH_FAILED,
  USER_LIST_FREE,
  USER_INFO_DELETED
} from '../actions/user';

export default function users(state = {
  readyState: USER_LIST_FETCH_FAILED,
  list: null
}, action) {
  switch (action.type) {
    case USER_LIST_FETCHING:
      return Object.assign({}, state, {
        readyState: USER_LIST_FETCHING
      });
    case USER_LIST_FETCH_FAILED:
      return Object.assign({}, state, {
        readyState: USER_LIST_FETCH_FAILED,
        error: action.error
      });
    case USER_LIST_FETCHED:
      return Object.assign({}, state, {
        readyState: USER_LIST_FETCHED,
        list: action.result
      });
    case USER_LIST_FREE:
      return Object.assign({}, state, {
        readyState: USER_LIST_FETCH_FAILED,
        list: null
      });
    case USER_INFO_DELETED:
      return Object.assign({}, state, {
        list: state.list.filter(user => user.login !== action.userId)
      });
    default:
      return state;
  }
}
