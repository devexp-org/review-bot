class FetchError extends Error {}

function reason(error) {
  if (error.response && error.response.status === 404) {
    return 'not found';
  }

  if (error.response && error.response.status === 422) {
    return 'validation error';
  }

  return 'unknown';
}

export const handleFetchResponse = (id, dispatch, success, failure) => (response) => {
  return Promise.resolve(response)
    .then(response => {
      if (!response.ok) {
        throw new FetchError(response);
      }
      return response;
    })
    .then(response => response.json())
    .then(result => dispatch({ type: success, id, data: result }))
    .catch(error => dispatch({ type: failure, id, error, reason: reason(error) }));
};

export const handleSubmitResponse = (id, dispatch, success, failure) => (response) => {
  return Promise.resolve(response)
    .then(response => Promise.all([response, response.json()]))
    .then(([response, json]) => {
      const error = new FetchError(response);
      error.response = response;

      if (response.status === 422) {
        error.errors = json.errors;
        throw error;
      }

      if (!response.ok) {
        throw error;
      }

      return json;
    })
    .then(result => dispatch({ type: success, id, data: result }))
    .catch(error => dispatch({ type: failure, id, error, errors: error.errors, reason: reason(error) }));
};
