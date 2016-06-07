import { RtmClient, MemoryDataStore } from '@slack/client';
import AbstractTransport from '../notification/transport';

export default class Slack extends AbstractTransport {

  /**
   * @constructor
   *
   * @param {Object} logger
   * @param {Object} options
   * @param {String} options.token
   * @param {String} options.autoReconnect
   * @param {String} options.autoMark
   * @param {String} options.host
   * @param {Boolean} options.silent - in silent mode messages should not be sent
   */
  constructor(logger, options) {
    super();

    if (!options || !options.token) {
      throw new Error('Need to pass token for slack notification');
    }

    this.logger = logger;

    this._host = options.host;
    this._token = options.token;
    this._silent = options.silent;
    this._autoMark = Boolean(options.autoMark);
    this._autoReconnect = Boolean(options.autoReconnect);

    this._client = null;
  }

  /**
   * Initiate connect to slack server.
   *
   * @return {Promise}
   */
  connect() {

    const client = new RtmClient(this._token, {
      autoMark: this._autoMark,
      dataStore: new MemoryDataStore(),
      autoReconnect: this._autoReconnect
    });

    this._client = client;

    return new Promise(resolve => {

      client.on('open', () => {
        resolve();
      });

      client.on('ws_error', (error) => {
        this.logger.error(error);
      });

      client.on('authenticated', (data) => {
        this.logger.info(`Connected as ${data.self.name} of ${data.team.name}`);
      });

      client.on('disconnect', () => {
        this.logger.info('Disconnected');
      });

      client.start();

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
    const mail = to + '@' + this._host;
    const user = this._client.dataStore.getUserByEmail(mail);

    if (!user || !user.id) {
      this.logger.error(`Cannot found user ${mail}`);
      return;
    }

    const directMessage = this._client.dataStore.getDMByName(user.name);

    if (!directMessage || !directMessage.id) {
      this.logger.error(`Cannot send message to ${mail} – ${user.id}`);
      return;
    }

    this.logger.info(`Send message to: ${mail} — ${body}`);

    if (this._silent) return;

    try {
      this._client.sendMessage(body, directMessage.id);
    } catch (e) {
      this.logger.error(`Error on sending message to ${mail} — ${user.id}`);
      this.logger.error(e);
    }
  }

}
