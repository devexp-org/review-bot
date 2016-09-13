export const USER_FETCHING = 'USER_FETCHING';
export const USER_FETCHED = 'USER_FETCHED';
export const USER_FETCH_FAILED = 'USER_FETCH_FAILED';
export const USER_DELETING = 'USER_DELETING';
export const USER_DELETED = 'USER_DELETED';
export const USER_DELETE_FAILED = 'USER_DELETE_FAILED';
export const USER_FREE = 'USER_FREE';

const ENDPOINT = 'http://localhost:8080/users/';

export function fetchUser(userId) {
  return (dispatch) => {
    dispatch({ type: USER_FETCHING, userId });

    return fetch(ENDPOINT + userId)
      .then(response => response.json())
      .then(
        (result) => dispatch({ type: USER_FETCHED, userId, result }),
        (error)  => dispatch({ type: USER_FETCH_FAILED, userId, error })
      );
  };
}

export function deleteUser(userId) {
  return (dispatch) => {
    dispatch({ type: USER_DELETING, userId });

    return fetch(ENDPOINT + userId, { method: 'DELETE' })
      .then(response => response.json())
      .then(
        (result) => dispatch({ type: USER_DELETED, userId, result }),
        (error)  => dispatch({ type: USER_DELETE_FAILED, userId, error })
      );
  };
}

export function freeUser(userId) {
  return { type: USER_FREE, userId };
}
