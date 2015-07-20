var logger = require('app/core/logger');
var Client = require('node-xmpp-client');
var ltx = Client.ltx;

var queue = [];

module.exports = {

    /**
     * Initiate connect to jabber server.
     *
     * @param {Object} options
     * @param {String} options.auth.login
     * @param {String} options.auth.password
     */
    init: function init(options) {
        if (!options || !options.auth || !options.auth.login) {
            throw new Error('Need to pass valid login and password for jabber notification');
        }

        var login = options.auth && options.auth.login;
        var password = options.auth && options.auth.password;

        this._maxQueue = options.maxQueue || 50;

        var client = new Client({ jid: login, password: password, reconnect: true });
        client.addListener('error', logger.error.bind(logger, 'Jabber client error: '));
        client.connection.socket.on('error', logger.error.bind(logger, 'Jabber connection error: '));

        var _this = this;
        this._online = false;
        client.addListener('online', function (data) {
            logger.info('Connected as ' + data.jid.user + '@' + data.jid.domain);
            _this._online = true;
            _this._checkQueue();
        });

        client.addListener('offline', function () {
            _this._online = false;
        });

        client.on('stanza', function (stanza) {
            logger.info('Incoming message: ', stanza.toString());
        });

        this._client = client;
    },

    /**
     * @private
     */
    _checkQueue: function () {
        if (!this._client || !this._online || queue.length === 0) {
            return;
        }

        do {
            var message = queue.shift();
            this.sendMessage(message.to, message.body);
        } while (queue.length > 0);
    },

    /**
     * Stop listen incoming message and close socket.
     */
    close: function () {
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
    sendMessage: function (to, body) {
        if (this._client && this._online) {
            var stanza = new ltx.Element('message', { to: to, type: 'chat' })
                .c('body').t(body);
            this._client.send(stanza);
        } else {
            queue.push({ to: to, body: body });
            if (queue.length > this._maxQueue) {
                queue = queue.slice(-this.maxQueue);
            }
        }
    }

};

