export const USER_FORM_CHANGE = 'USER_FORM_CHANGE';
export const USER_FORM_SUBMIT = 'USER_FORM_SUBMIT';
export const USER_FORM_SUBMITING = 'USER_FORM_SUBMITING';
export const USER_FORM_SUBMITED = 'USER_FORM_SUBMITED';
export const USER_FORM_FAILED = 'USER_FORM_FAILED';

const HOST = 'http://localhost:8080/users/';

export function submitUser(dispatch, properties) {
  dispatch({ type: USER_FORM_SUBMITING });

  return fetch(HOST, {
      body: JSON.stringify(properties),
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      return response.json();
    })
    .then(
      (result) => dispatch({ type: USER_FORM_SUBMITED, result }),
      (error) => dispatch({ type: USER_FORM_FAILED, error })
    );
}
