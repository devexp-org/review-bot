export const USER_INFO_FETCHING = 'USER_INFO_FETCHING';
export const USER_INFO_FETCHED = 'USER_INFO_FETCHED';
export const USER_INFO_FETCH_FAILED = 'USER_INFO_FETCH_FAILED';

export const USER_LIST_FETCHING = 'USER_LIST_FETCHING';
export const USER_LIST_FETCHED = 'USER_LIST_FETCHED';
export const USER_LIST_FETCH_FAILED = 'USER_LIST_FETCH_FAILED';

export const USER_FORM_CHANGE = 'USER_FORM_CHANGE';
export const USER_FORM_SUBMITING = 'USER_FORM_SUBMITING';
export const USER_FORM_SUBMITED = 'USER_FORM_SUBMITED';
export const USER_FORM_SUBMIT_FAILED = 'USER_FORM_FAILED';

export const USER_INFO_DELETING = 'USER_INFO_DELETING';
export const USER_INFO_DELETED = 'USER_INFO_DELETED';
export const USER_INFO_DELETE_FAILED = 'USER_INFO_DELETE_FAILED';

const ENDPOINT = 'http://localhost:8080/users/';

export function fetchUserInfo(userId) {
  return (dispatch) => {
    dispatch({ type: USER_INFO_FETCHING, userId });

    return fetch(ENDPOINT + userId)
      .then(response => response.json())
      .then(
        (result) => dispatch({ type: USER_INFO_FETCHED, userId, result }),
        (error)  => dispatch({ type: USER_INFO_FETCH_FAILED, userId, error })
      );
  };
}

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
      .then(response => Promise.all([response.json(), response.status]))
      .then(
        ([result, status]) => {
          if (status === 422) {
            dispatch({ type: USER_FORM_SUBMIT_FAILED, result });
          } else {
            dispatch({ type: USER_FORM_SUBMITED, result });
            return dispatch(fetchUserList())
          }
        },
        (error)  => dispatch({ type: USER_FORM_SUBMIT_FAILED, error })
      );
  };
}

export function deleteUser(userId) {
  return (dispatch) => {
    dispatch({ type: USER_INFO_DELETING, userId });

    return fetch(ENDPOINT + userId, { method: 'DELETE' })
      .then(response => response.json())
      .then(
        (result) => dispatch({ type: USER_INFO_DELETED, userId, result }),
        (error)  => dispatch({ type: USER_INFO_DELETE_FAILED, userId, error })
      );
  };
}
