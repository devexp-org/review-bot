import proxyquire from 'proxyquire';
import loggerMock from '../../../logger/__mocks__/';
import nodeXmppMock from '../__mocks__/node-xmpp';

describe('services/notification/transport-jabber/class', function () {

  let xmpp, options, logger, jabber, Jabber;

  beforeEach(function () {

    xmpp = nodeXmppMock();

    logger = loggerMock();

    Jabber = proxyquire('../class', {
      'node-xmpp-client': xmpp
    }).default;

    options = {
      auth: { login: 'login', password: 'password' }
    };

    jabber = new Jabber(logger, options);

  });

  describe('#constructor', function () {

    it('should throw an error if login or password is not set', function () {
      assert.throws(() => new Jabber(logger, {}), /login and password/);
    });

  });

  describe('#connect', function () {

    it('should initiate connection to jabber host', function (done) {
      jabber.connect()
        .then(() => assert.called(xmpp.connect))
        .then(done, done);
    });

    it('should log errors', function (done) {
      xmpp.on
        .withArgs('error')
        .callsArgWith(1, new Error());

      jabber.connect()
        .then(() => assert.called(logger.error))
        .then(done, done);
    });

    it('should log when goes online', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };
      xmpp.on
        .withArgs('online')
        .callsArgWith(1, data);

      sinon.stub(jabber, 'checkQueue');

      jabber.connect()
        .then(() => assert.called(logger.info))
        .then(done, done);
    });

    it('should log when goes offline', function (done) {
      xmpp.on
        .withArgs('offline')
        .callsArgWith(1);

      jabber.connect()
        .then(() => assert.called(logger.info))
        .then(done, done);
    });

    it('should log when receive message', function (done) {
      xmpp.on.withArgs('stanza').callsArgWith(1, 'stanza');

      jabber.connect()
        .then(() => assert.called(logger.info))
        .then(done, done);
    });

  });

  describe('#close', function () {

    it('should close connection to jabber', function (done) {
      jabber.connect()
        .then(() => jabber.close())
        .then(() => assert.called(xmpp.end))
        .then(done, done);
    });

    it('should not throw an error if client is not connect before', function (done) {
      jabber.close()
        .then(() => assert.notCalled(xmpp.end))
        .then(done, done);
    });

  });

  describe('#send', function () {

    it('should send message to user if client is online', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };

      xmpp.on
        .withArgs('online')
        .callsArgWith(1, data);

      jabber.connect()
        .then(() => jabber.send('foo', 'message'))
        .then(() => assert.called(xmpp.send))
        .then(done, done);
    });

    it('should enqueue message if client is offline', function (done) {
      jabber.connect()
        .then(() => jabber.send('foo', 'message'))
        .then(() => assert.notCalled(xmpp.send))
        .then(done, done);
    });

    it('should send message from queue when client goes online', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };

      setTimeout(() => {
        xmpp.on.withArgs('online').callArgWith(1, data);
      }, 5);

      jabber.connect()
        .then(() => jabber.send('foo', 'message'))
        .then(() => assert.notCalled(xmpp.send))
        .then(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              assert.called(xmpp.send);
              resolve();
            }, 10);
          });
        })
        .then(done, done);
    });

    it('should not send message in silent mode', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };

      xmpp.on
        .withArgs('online')
        .callsArgWith(1, data);

      options.silent = true;

      jabber = new Jabber(logger, options);

      jabber.connect()
        .then(() => jabber.send('foo', 'message'))
        .then(() => assert.notCalled(xmpp.send))
        .then(done, done);
    });

    it('should send `keep-alive` messages', function (done) {
      const clock = sinon.useFakeTimers();

      jabber.connect()
        .then(() => clock.tick(15000))
        .then(() => assert.callCount(xmpp.send, 1))
        .then(() => clock.tick(10000))
        .then(() => assert.callCount(xmpp.send, 2))
        .then(() => clock.tick(20000))
        .then(() => assert.callCount(xmpp.send, 4))
        .then(() => clock.restore())
        .then(done, done);
    });

    it('should not keep too many messages in queue', function (done) {

      const data = { jid: { user: 'user', domain: 'domain' } };

      setTimeout(() => {
        xmpp.on.withArgs('online').callArgWith(1, data);
      }, 5);

      jabber.connect()
        .then(() => {
          const promise = [];
          for (let i = 0; i < 1000; i++) {
            promise.push(jabber.send('foo', 'message'));
          }
          return Promise.all(promise);
        })
        .then(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              assert.isBelow(xmpp.send.callCount, 500);
              resolve();
            }, 10);
          });
        })
        .then(done, done);

    });

  });

});
