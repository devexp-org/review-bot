import { find } from 'lodash';
import TelegramBot from 'node-telegram-bot-api';
import AbstractTransport from '../transport-abstract';

export default class Slack extends AbstractTransport {

  /**
   * @constructor
   *
   * @param {Object} logger
   * @param {Object} UserModel
   * @param {Object} options
   * @param {String} options.token
   * @param {Boolean} options.silent - in silent mode messages should not be sent
   */
  constructor(logger, UserModel, options) {
    super();

    if (!options || !options.token) {
      throw new Error('Need to pass token for slack notification');
    }

    this.logger = logger;
    this.UserModel = UserModel;

    this._token = options.token;
    this._silent = options.silent;

    this._client = null;
  }

  /**
   * Start polling for a new messages.
   *
   * @return {Promise}
   */
  connect() {

    const client = new TelegramBot(this._token);

    this._client = client;

    client.on('polling_error', (error) => {
      this.logger.error(error);
    });

    client.on('message', (msg) => {
      this._handleMessage(msg);
    });

    return client.startPolling()
      .then(() => this.logger.info('Connected to telegram'));

  }

  /**
   * Stop polling for a new messages.
   *
   * @return {Promise}
   */
  close() {
    if (this._client) {
      return this._client.stopPolling();
    }

    return Promise.resolve();
  }

  /**
   * Send a message to to a specific person.
   *
   * @param {String} to - username
   * @param {String} body - message body
   *
   * @return {Promise}
   */
  send(to, body) {
    const chatId = to.telegramChatId;

    if (!chatId) {
      this.logger.error(`Does not know chatId for ${to.login}`);
      return;
    }

    this.logger.info(`Send message to: ${to.login} (${chatId}) — ${body}`);

    if (this._silent) return;

    return this._client.sendMessage(chatId, body);

  }

  _handleMessage(msg) {
    const matches = (/\/link ([-a-z]+)/i).exec(msg.text);
    const account = matches[1];

    if (!account) return;

    this.UserModel.findByContact('email', account)
      .then(users => {
        if (users.length === 0) {
          this.logger.warn(`Cannot find ${account}`);
          return;
        }

        if (users.length > 1) {
          this.logger.warn(`${account} has more then 1 owners`);
          return;
        }

        const user = users[0];
        const contact = find(user.contacts, { id: 'email', account });
        contact.set('metadata.telegramChatId', msg.chat.id);

        this.logger.info(`Save chatId for ${user.login}`);

        return user.save();
      });
  }

}
