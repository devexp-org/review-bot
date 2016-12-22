export default class AbstractTransport {

  /**
   * Send a message to a given person.
   *
   * @param {String} login
   * @param {String} message
   */
  send(login, message) {
  }

  /**
   * Stop listen incoming message and close socket.
   *
   * @param {Function} [callback]
   */
  close(callback) {
    callback && callback();
  }

  /**
   * Initiate connect to server.
   *
   * @return {Promise}
   */
  connect() {
    return Promise.resolve();
  }

}
