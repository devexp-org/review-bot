import * as UserActions from '../actions/user';
import * as UserFormActions from '../actions/userForm';
import * as UserListActions from '../actions/userList';

export default function users(state = {
  list: null,
  readyState: UserListActions.USER_LIST_INVALID
}, action) {
  switch (action.type) {
    case UserListActions.USER_LIST_FETCHING:
      return Object.assign({}, state, {
        readyState: UserListActions.USER_LIST_FETCHING
      });
    case UserListActions.USER_LIST_FETCH_FAILED:
      return Object.assign({}, state, {
        error: action.error,
        readyState: UserListActions.USER_LIST_FETCH_FAILED
      });
    case UserListActions.USER_LIST_FETCHED:
      return Object.assign({}, state, {
        list: action.result,
        readyState: UserListActions.USER_LIST_FETCHED
      });
    case UserListActions.USER_LIST_FREE:
      return Object.assign({}, state, {
        list: null,
        readyState: UserListActions.USER_LIST_INVALID
      });
    case UserActions.USER_DELETED:
      return Object.assign({}, state, {
        list: state.list.filter(user => user.login !== action.userId)
      });
    default:
      return state;
  }
}
