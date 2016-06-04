export default function middleware() {

  return function (req, res, next) {

    /**
     * Alias for "json" method
     *
     * @param {*} data - response data
     */
    res.ok = function (data) {
      this.json(data);
    };

    /**
     * Send failure response.
     *
     * @param {String} [message] — error message (default: error).
     * @param {Number} [status] — http response status (default: 500).
     */
    res.error = function (message, status) {
      message = message || 'Internal error';

      this
        .status(status || 500)
        .json({ error: String(message) });
    };

    /**
     * Send success response.
     *
     * @param {*} [data] — response data.
     */
    res.success = function (data) {
      this.json({ data: data || {} });
    };

    next();

  };

}
