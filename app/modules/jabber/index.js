import logger from 'app/modules/logger';
import Client from 'node-xmpp-client';

const ltx = Client.ltx;
let queue = [];

export default {

    /**
     * Initiate connect to jabber server.
     *
     * @param {Object} options
     * @param {String} options.auth.login
     * @param {String} options.auth.password
     */
    init(options) {
        if (!options || !options.auth || !options.auth.login) {
            throw new Error('Need to pass valid login and password for jabber notification');
        }

        const login = options.auth && options.auth.login;
        const password = options.auth && options.auth.password;

        this._online = false;
        this._maxQueue = options.maxQueue || 50;

        const client = new Client({ jid: login, password, reconnect: true });
        client.addListener('error', logger.error.bind(logger, 'Jabber client error: '));
        client.connection.socket.on('error', logger.error.bind(logger, 'Jabber connection error: '));

        client.addListener('online', data => {
            logger.info('Connected as ' + data.jid.user + '@' + data.jid.domain);
            this._online = true;
            this._checkQueue();
        });

        client.addListener('offline', () => { this._online = false; });

        client.on('stanza', stanza => {
            logger.info('Incoming message: ', stanza.toString());
        });

        this._client = client;
    },

    /**
     * @private
     */
    _checkQueue() {
        if (!this._client || !this._online || queue.length === 0) {
            return;
        }

        do {
            const message = queue.shift();
            this.sendMessage(message.to, message.body);
        } while (queue.length > 0);
    },

    /**
     * Stop listen incoming message and close socket.
     */
    close() {
        if (this._client) {
            this._client.end();
        }
        this._client = null;
    },

    /**
     * Send a message to to a specific person.
     *
     * @param {String} to - user jid
     * @param {String} body - message body
     */
    sendMessage(to, body) {
        if (this._client && this._online) {
            const stanza = new ltx.Element('message', { to: to, type: 'chat' })
                .c('body')
                .t(body);
            this._client.send(stanza);
        } else {
            queue.push({ to: to, body: body });
            if (queue.length > this._maxQueue) {
                queue = queue.slice(-this.maxQueue);
            }
        }

    }

};
