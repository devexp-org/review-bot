/* eslint-disable no-console */

import { RtmClient as Client } from 'slack-client';

export default class Slack {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {String} options.token
   * @param {String} options.autoReconnect
   * @param {String} options.autoMark
   * @param {String} options.host
   * @param {Boolean} options.silent - in silent mode messages should not be sent
   * @param {Function} [options.info]
   */
  constructor(options) {
    if (!options || !options.token) {
      throw new Error('Need to pass token for slack notification');
    }

    this.token = options.token;
    this.autoMark = !!options.autoMark;
    this.autoReconnect = !!options.autoReconnect;

    this.info = options.info || console.log.bind(console);
    this.host = options.host;
    this.silent = options.silent;

    this._client = null;
  }

  /**
   * Initiate connect to slack server.
   *
   * @return {Promise}
   */
  connect() {

    const client = new Client(this.token, this.autoReconnect, this.autoMark);

    this._client = client;

    return new Promise(resolve => {
      client.on('open', () => resolve());

      client.on('error', error => {
        this.info('Error:\n' + error);
      });

      client.on('open', data => {
        this.info(`Connected as ${this._client.self.name} of ${this._client.team.name}`);
      });

      client.on('close', () => {
        this.info('Disconnected');
      });

      client.login();
    });

  }

  /**
   * Stop listen incoming message and close socket.
   *
   * @param {Function} callback
   */
  close(callback) {
    if (this._client) {
      this._client.disconnect();
    }

    callback && callback();
  }

  /**
   * Send a message to to a specific person.
   * If client goes offline, stores message in queue.
   *
   * @param {String} to - username
   * @param {String} body - message body
   */
  send(to, body) {
    const mail = to + '@' + this.host;
    const user = this._getUserByEmail(mail);

    if (!user || !user.id) {
      this.info(`Cannot found user ${mail}`);
      return;
    }

    const uid = user.id;

    this._client.openDM(uid, (data) => {
      if (!data.ok) {
        this.info(`Cannot send message to ${mail} – ${uid}`);
        return;
      }

      const directMessage = this._client.getDMByID(data.channel.id);

      this.info(`Send message to: ${mail} — ${body}`);

      if (this.silent) {
        return;
      }

      try {
        directMessage.send(body);
      } catch (e) {
        this.info(`Error on sending message to ${mail} — ${uid}`);
        this.info(e);
      }
    });
  }

  /**
   * Returns Slack user
   *
   * @param {String} mail
   *
   * @return {Object}
   */
  _getUserByEmail(mail) {
    return this._client.getUserByEmail(mail);
  }

}
