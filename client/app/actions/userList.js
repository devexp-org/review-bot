export const USER_LIST_INVALID = 'USER_LIST_INVALID';
export const USER_LIST_FETCHING = 'USER_LIST_FETCHING';
export const USER_LIST_FETCHED = 'USER_LIST_FETCHED';
export const USER_LIST_FETCH_FAILED = 'USER_LIST_FETCH_FAILED';
export const USER_LIST_FREE = 'USER_LIST_FREE';

const ENDPOINT = 'http://localhost:8080/users/';

export function fetchUserList() {
  return (dispatch) => {
    dispatch({ type: USER_LIST_FETCHING });

    return fetch(ENDPOINT)
      .then(response => response.json())
      .then(
        (result) => dispatch({ type: USER_LIST_FETCHED, result }),
        (error)  => dispatch({ type: USER_LIST_FETCH_FAILED, error })
      );
  };
}

export function freeUserList() {
  return { type: USER_LIST_FREE }
}
