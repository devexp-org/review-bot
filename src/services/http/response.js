export default function middleware() {

  return function (req, res, next) {

    /**
     * Send failure response.
     *
     * @param {Object} [error] — error message (default: Internal Error).
     * @param {Number} [status] — http response status (default: 500).
     */
    res.error = function (error, status) {
      error = error || 'Internal Error';

      if (error.name === 'Error') {
        error = error.message;
      }

      this
        .status(status || 500)
        .json({ error });
    };

    /**
     * Send success response.
     *
     * @param {*} [data] — response data.
     */
    res.success = function (data) {
      data = data || {};
      this.json({ data });
    };

    next();

  };

}
