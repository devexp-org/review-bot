import xmppMock from '../__mocks__/xmpp';
import proxyquire from 'proxyquire';

describe('services/jabber/class', function () {

  let xmpp, info, options, Jabber;
  beforeEach(function () {
    xmpp = xmppMock();

    info = sinon.stub();

    Jabber = proxyquire('../class', {
      'node-xmpp-client': xmpp
    }).default;

    options = {
      auth: { login: 'login', password: 'password' },
      info: info
    };
  });

  describe('#constructor', function () {

    it('should return Jabber', function () {
      const jabber = new Jabber(options);

      assert.property(jabber, 'send');
      assert.property(jabber, 'close');
      assert.property(jabber, 'connect');
    });

    it('should throw an error if login and password is not set', function () {
      assert.throws(() => new Jabber({}), /login and password/);
    });

  });

  describe('#connect', function () {

    let jabber;
    beforeEach(function () {
      jabber = new Jabber(options);
    });

    it('should initiate connection to jabber host', function (done) {
      // TODO check interval with fake

      jabber.connect()
        .then(() => assert.called(xmpp.connect))
        .then(() => jabber.close(done))
        .catch(done);
    });

    it('should log errors', function (done) {
      xmpp.on.withArgs('error').callsArgWith(1, new Error());

      jabber.connect()
        .then(() => assert.called(info))
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
        .then(() => assert.called(info))
        .then(() => jabber.close(done))
        .catch(done);
    });

    it('should log when receive message', function (done) {
      xmpp.on.withArgs('stanza').callsArgWith(1, 'stanza');

      jabber.connect()
        .then(() => assert.called(info))
        .then(() => jabber.close(done))
        .catch(done);
    });

  });

  describe('#close', function () {

    let jabber;

    beforeEach(function () {
      jabber = new Jabber(options);
    });

    it('should close connection to jabber', function (done) {
      jabber.close(done);
    });

  });

  describe('#send', function () {

    let jabber;
    beforeEach(function () {
      jabber = new Jabber(options);
    });

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
      jabber = new Jabber(options);

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
