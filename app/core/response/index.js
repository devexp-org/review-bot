export default {
    middleware: function () {
        return function (req, res, next) {
            /**
             * Sends success response
             *
             * @param {*} [data] — response data
             */
            res.success = function (data) {
                this.json({
                    data: data || {}
                });
            };

            /**
             * Sends error message
             *
             * @param  {String} [msg] — err message (default: error)
             * @param  {Number} [status] — http response status (default: 500)
             */
            res.error = function (msg, status) {
                this
                    .status(status || 500)
                    .json({
                        error: msg || 'error'
                    });
            };

            next();
        };
    }
};
