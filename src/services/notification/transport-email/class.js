import nodemailer from 'nodemailer';
import sMTPTransport from 'nodemailer-smtp-transport';
import AbstractTransport from '../transport-abstract';

export default class Email extends AbstractTransport {

  /**
   * @constructor
   *
   * @param {Object} logger
   * @param {Object} options
   * @param {String} [options.sender]
   * @param {Boolean} [options.silent] - in silent mode messages should not be sent
   */
  constructor(logger, options) {
    super();

    this.logger = logger;

    this._silent = options.silent;
    this._sender = options.sender || 'no-reply@yandex-team.ru';
    this._transportOptions = options.transportOptions;

    this._client = null;
  }

  /**
   * Setup nodemailer transport.
   *
   * @return {Promise}
   */
  connect() {
    const transport = sMTPTransport(this._transportOptions);
    this._client = nodemailer.createTransport(transport);

    return Promise.resolve();
  }

  /**
   * Send a message to to a specific person.
   * If client goes offline, stores message in queue.
   *
   * @param {String} user
   * @param {String} body
   *
   * @return {Promise}
   */
  send(user, body) {

    const to = user.login + '@yandex-team.ru';

    this.logger.info(`Send message to: ${to} — ${body}`);

    if (this._silent) return Promise.resolve();

    const handle = {
      to: to,
      text: body,
      from: this._sender,
      subject: '[CodeReview] ' + body.split('\n')[1]
    };

    return new Promise(resolve => {
      this._client.sendMail(handle, (err, info) => {
        if (err) {
          this.logger.error(`Error on sending message to ${to}`);
          this.logger.error(err);
        }

        resolve();
      });
    });

  }

}
