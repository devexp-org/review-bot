import http from 'http';

/**
 * @param {Function} handler
 * @param {Number|String} port — TCP port number or unix-socket file path
 *
 * @returns {http.Server}
 */
export default function multilistener(handler, port) {
    var server = http.createServer(handler);

    if (isNaN(port)) {
        // listen unix-socket
        server.listen(port);
    } else {
        // listen ipv4/ipv6 address
        server.listen(port, '::');
    }

    return server;
}
