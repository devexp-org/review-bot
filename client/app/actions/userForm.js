import config from '../config';

export const USER_EDIT = 'USER_EDIT';

export const USER_FORM_READY = 'USER_FORM_READY';
export const USER_FORM_ERROR = 'USER_FORM_ERROR';
export const USER_FORM_CHANGE = 'USER_FORM_CHANGE';
export const USER_FORM_SUBMITING = 'USER_FORM_SUBMITING';
export const USER_FORM_SUBMITED = 'USER_FORM_SUBMITED';
export const USER_FORM_SUBMIT_FAILED = 'USER_FORM_SUBMIT_FAILED';

export const USER_FORM_ADD_CONTACT = 'USER_FORM_ADD_CONTACT';
export const USER_FORM_CHANGE_CONTACT = 'USER_FORM_CHANGE_CONTACT';

const ENDPOINT = config.api.prefix + 'users/';

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
      .then(response => response.json().then(x => [x, response.status]))
      .then(
        ([result, status]) =>
          dispatch({ type: USER_FORM_SUBMITED, result, status }),
        (error)  =>
          dispatch({ type: USER_FORM_SUBMIT_FAILED, error })
      );
  };
}

export function updateUser(login, form) {
  return (dispatch) => {
    dispatch({ type: USER_FORM_SUBMITING });

    return fetch(ENDPOINT + login, {
        body: JSON.stringify(form),
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json().then(x => [x, response.status]))
      .then(
        ([result, status]) =>
          dispatch({ type: USER_FORM_SUBMITED, result, status }),
        (error)  =>
          dispatch({ type: USER_FORM_SUBMIT_FAILED, error })
      );
  };
}
