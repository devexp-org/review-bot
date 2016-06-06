/* eslint-disable no-console */

import Client, { ltx } from 'node-xmpp-client';

export const KEEP_ALIVE_INTERVAL = 10000;

export default class Jabber {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {String} options.auth.login
   * @param {String} options.auth.password
   * @param {Boolean} options.silent - in silent mode messages should not be sent
   * @param {Number} [options.maxQueue]
   * @param {Function} [options.info]
   */
  constructor(options) {
    if (!options || !options.auth || !options.auth.login) {
      throw new Error('Need to pass valid login and password for jabber notification');
    }

    this.auth = options.auth;
    this.info = options.info || console.log.bind(console);
    this.silent = options.silent;

    this._queue = [];
    this._client = null;
    this._online = false;
    this._maxQueue = options.maxQueue || 50;
  }

  /**
   * Initiate connect to jabber server.
   *
   * @return {Promise}
   */
  connect() {

    const client = new Client({
      jid: this.auth.login,
      password: this.auth.password,
      reconnect: false,
      autostart: false
    });

    this._client = client;

    return new Promise(resolve => {
      client.on('connect', () => resolve());

      client.on('error', (error) => {
        this.info('Error:\n' + error.stack);
      });

      client.on('online', (data) => {
        this.info(`Connected as ${data.jid.user}@${data.jid.domain}`);

        this._online = true;

        this.checkQueue();
      });

      client.on('offline', () => {
        this._online = false;

        this.info('Disconnected');
      });

      client.on('stanza', (stanza) => {
        this.info('Incoming message: ' + stanza.toString());
      });

      client.connect();

      // keep-alive
      clearInterval(this._keepAliveId);
      this._keepAliveId = setInterval(
        () => { client.send(' '); },
        KEEP_ALIVE_INTERVAL
      );
    });

  }

  /**
   * @private
   */
  checkQueue() {
    if (!this._client || !this._online || this._queue.length === 0) {
      return;
    }

    do {
      const message = this._queue.shift();
      this._send(message.to, message.body);
    } while (this._queue.length > 0);
  }

  /**
   * Stop listen incoming message and close socket.
   *
   * @param {Function} [callback]
   */
  close(callback) {
    if (this._client) {
      this._client.end();
    }

    clearInterval(this._keepAliveId);

    this._client = null;

    callback && callback();
  }

  /**
   * Send a message to to a specific person.
   * If client goes offline, stores message in queue.
   *
   * @param {String} to - user jid
   * @param {String} body - message body
   */
  send(to, body) {
    if (this._client && this._online) {
      this._send(to, body);
    } else {
      this._queue.push({ to, body });

      if (this._queue.length > this._maxQueue) {
        this._queue = this._queue.slice(-this._maxQueue);
      }
    }
  }

  /**
   * Send a message to to a specific person.
   *
   * @param {String} to - user jid
   * @param {String} body - message body
   */
  _send(to, body) {
    this.info(`Send message to: ${to} — ${body}`);

    if (this.silent) {
      return;
    }

    const elem = { to, type: 'chat' };
    const stanza = new ltx.Element('message', elem).c('body').t(body);

    this._client.send(stanza);
  }

}
