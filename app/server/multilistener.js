var http = require('http');

/**
 * @param {Function} handler
 * @param {Number|String} port — TCP port number or unix-socket file path
 *
 * @returns {http.Server}
 */
module.exports = function multilistener(handler, port) {
    var srv = http.createServer(handler);
    var srv4;

    if (isNaN(port)) {
        // port is not a number, suppose it's a path of unix-socket
        srv.listen(port);
    } else {
        // try to listen ipv6 address
        srv.listen(port, '::');
        srv.on('listening', function () {
            // try to listen ipv4 too
            srv4 = http.createServer(handler).listen(port);

            // handle ipv4 server error to prevent app fail on EADDINUSE if ipv6 server handles both
            // ipv6 and ipv4 requests in accordance with kernel settings
            srv4.on('error', function (err) {
                if (err.code === 'EADDRINUSE') {
                    console.log('listen: looks like AF_INET6 socket serve both ipv6 and ipv4 requests');
                } else {
                    throw err;
                }
            });

            srv4.unref();
            srv.on('close', srv4.close.bind(srv4));
        });
    }

    return srv;
};
