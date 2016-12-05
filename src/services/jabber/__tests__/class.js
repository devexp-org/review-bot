import proxyquire from 'proxyquire';
import loggerMock from '../../logger/__mocks__/';
import nodeXmppMock from '../__mocks__/node-xmpp';

describe('services/jabber/class', function () {

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

    it('should return Jabber', function () {
      const jabber = new Jabber(logger, options);

      assert.property(jabber, 'send');
      assert.property(jabber, 'close');
      assert.property(jabber, 'connect');
    });

    it('should throw an error if login or password is not set', function () {
      assert.throws(() => new Jabber(logger, {}), /login and password/);
    });

  });

  describe('#connect', function () {

    let clock;
    beforeEach(function () {
      clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should initiate connection to jabber host', function (done) {
      jabber.connect()
        .then(() => assert.called(xmpp.connect))
        .then(() => jabber.close(done))
        .catch(done);
    });

    it('should initiate connection to jabber host', function (done) {
      jabber.connect()
        .then(() => assert.called(xmpp.connect))
        .then(() => jabber.close(done))
        .catch(done);
    });

    it('should log errors', function (done) {
      xmpp.on.withArgs('error').callsArgWith(1, new Error());

      jabber.connect()
        .then(() => assert.called(logger.error))
        .then(() => jabber.close(done))
        .catch(done);

    });

    it('should log when goes online', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };
      xmpp.on.withArgs('online').callsArgWith(1, data);

      sinon.stub(jabber, 'checkQueue');

      jabber.connect()
        .then(() => jabber.close(done))
        .catch(done);
    });

    it('should log when goes offline', function (done) {
      xmpp.on.withArgs('offline').callsArgWith(1);

      jabber.connect()
        .then(() => assert.called(logger.info))
        .then(() => jabber.close(done))
        .catch(done);
    });

    it('should log when receive message', function (done) {
      xmpp.on.withArgs('stanza').callsArgWith(1, 'stanza');

      jabber.connect()
        .then(() => assert.called(logger.info))
        .then(() => jabber.close(done))
        .catch(done);
    });

  });

  describe('#close', function () {

    it('should close connection to jabber', function (done) {
      jabber.connect()
        .then(() => jabber.close(() => {
          assert.called(xmpp.end);
          done();
        }));
    });

    it('should not throw an error if client is not connect before', function (done) {
      jabber.close(() => {
        assert.notCalled(xmpp.end);
        done();
      });
    });

  });

  describe('#send', function () {

    it('should send message to user if client is online', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };
      xmpp.on.withArgs('online').callsArgWith(1, data);

      jabber.connect()
        .then(() => jabber.send('foo', 'message'))
        .then(() => assert.called(xmpp.send))
        .then(() => jabber.close(done))
        .catch(done);

    });

    it('should enqueue message if client is offline', function (done) {

      jabber.connect()
        .then(() => jabber.send('foo', 'message'))
        .then(() => assert.notCalled(xmpp.send))
        .then(() => jabber.close(done))
        .catch(done);

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
          setTimeout(() => {
            assert.called(xmpp.send);
            done();
          }, 10);
        })
        .catch(done);
    });

    it('should not send message in silent mode', function (done) {
      const data = { jid: { user: 'user', domain: 'domain' } };
      xmpp.on.withArgs('online').callsArgWith(1, data);

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

    it('should not keep to many messages in queue', function (done) {

      const data = { jid: { user: 'user', domain: 'domain' } };
      setTimeout(() => {
        xmpp.on.withArgs('online').callArgWith(1, data);
      }, 5);

      jabber.connect()
        .then(() => {
          for (let i = 0; i < 1000; i++) {
            jabber.send('foo', 'message');
          }
        })
        .then(() => {
          setTimeout(() => {
            assert.isBelow(xmpp.send.callCount, 500);
            done();
          }, 10);
        })
        .catch(done);

    });

  });

});
