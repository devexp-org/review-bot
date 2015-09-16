'use strict';

/* eslint-disable no-console */

import Client, { ltx } from 'node-xmpp-client';

export default class Jabber {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {String} options.auth.login
   * @param {String} options.auth.password
   * @param {Number} [options.maxQueue]
   * @param {Function} [options.info]
   */
  constructor(options) {
    if (!options || !options.auth || !options.auth.login) {
      throw new Error('Need to pass valid login and password for jabber notification');
    }

    this.auth = options.auth;
    this.info = options.info || console.log.bind(console);

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
      reconnect: true
    });

    this._client = client;

    return new Promise(resolve => {
      client.on('connect', () => resolve());

      client.addListener('error', (error) => {
        this.info('Error:\n' + error.stack);
      });

      client.addListener('online', data => {
        this._online = true;

        this.info(`Connected as ${data.jid.user}@${data.jid.domain}`);
        this.checkQueue();
      });

      client.addListener('offline', () => {
        this._online = false;

        this.info('Disconnected');
      });

      client.on('stanza', (stanza) => {
        this.info('Incoming message: ' + stanza.toString());
      });

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
      this.sendMessage(message.to, message.body);
    } while (this._queue.length > 0);
  }

  /**
   * Stop listen incoming message and close socket.
   */
  close() {
    if (this._client) {
      this._client.end();
    }

    this._client = null;
  }

  /**
   * Send a message to to a specific person.
   *
   * @param {String} to - user jid
   * @param {String} body - message body
   */
  send(to, body) {
    console.log(body);

    if (this._client && this._online) {
      const stanza = new ltx.Element('message', { to: to, type: 'chat' })
        .c('body').t(body);

      this._client.send(stanza);
    } else {
      this._queue.push({ to, body });

      if (this._queue.length > this._maxQueue) {
        this._queue = this._queue.slice(-this.maxQueue);
      }
    }
  }

}
