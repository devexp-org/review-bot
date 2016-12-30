export default class AbstractTransport {

  /**
   * Send a message to a given person.
   *
   * @param {String} login
   * @param {String} message
   *
   * @return {Promise}
   */
  send(login, message) {
    return Promise.resolve();
  }

  /**
   * Stop listen incoming message and close socket.
   *
   * @return {Promise}
   */
  close() {
    return Promise.resolve();
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
