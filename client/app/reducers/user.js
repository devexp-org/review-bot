import * as UserActions from '../actions/user';

export default function user(state = {}, action) {
  switch (action.type) {
    case UserActions.USER_FETCHING:
      return Object.assign({}, state, {
        [action.userId]: {
          readyState: UserActions.USER_FETCHING
        }
      });
    case UserActions.USER_FETCH_FAILED:
      return Object.assign({}, state, {
        [action.userId]: {
          error: action.error,
          readyState: UserActions.USER_FETCH_FAILED
        }
      });
    case UserActions.USER_FETCHED:
      return Object.assign({}, state, {
        [action.userId]: {
          info: action.result,
          readyState: UserActions.USER_FETCHED
        }
      });
    case UserActions.USER_FREE:
      return Object.assign({}, state, {
        [action.userId]: undefined
      });
    default:
      return state;
  }
}
