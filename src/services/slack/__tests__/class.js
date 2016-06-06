import proxyquire from 'proxyquire';

describe('services/slack/class', function () {

  let info, options, Slack, client, message, directMessage;
  beforeEach(function () {
    info = sinon.stub();

    client = sinon.stub();

    message = {
      ok: true,
      channel: { id: 'channel.id' }
    };

    directMessage = { send: sinon.stub() };

    client.prototype.on = sinon.stub();
    client.prototype.login = sinon.stub();
    client.prototype.disconnect = sinon.stub();
    client.prototype.getDMByID = sinon.stub()
      .returns(directMessage);
    client.prototype.openDM = sinon.stub()
      .withArgs('uid')
      .callsArgWith(1, message);
    client.prototype.getUserByEmail = sinon.stub()
      .returns({ id: 'id', uid: 'uid' });

    client.prototype.self = { name: 'self.name' };
    client.prototype.team = { name: 'team.name' };

    client.prototype.on
      .withArgs('open')
      .callsArgAsync(1);

    client.prototype.on
      .withArgs('close')
      .callsArgAsync(1);

    Slack = proxyquire('../class', {
      'slack-client': {
        RtmClient: client
      }
    }).default;

    options = {
      info: info,
      host: 'example.com',
      token: 'token'
    };
  });

  describe('#constructor', function () {

    it('should return Slack', function () {
      const slack = new Slack(options);

      assert.property(slack, 'send');
      assert.property(slack, 'close');
      assert.property(slack, 'connect');
    });

    it('should throw an error if login and password is not set', function () {
      assert.throws(() => new Slack({}), /token/);
    });

  });

  describe('#connect', function () {

    let slack;
    beforeEach(function () {
      slack = new Slack(options);
    });

    it('should initiate connection to slack', function (done) {
      slack.connect()
        .then(() => assert.called(client.prototype.login))
        .then(() => slack.close(done))
        .catch(done);
    });

    it('should log errors', function (done) {
      client.prototype.on
        .withArgs('error')
        .callsArgWith(1, new Error());

      slack.connect()
        .then(() => assert.called(info))
        .then(() => slack.close())
        .then(done, done);
    });

  });

  describe('#close', function () {

    let slack;
    beforeEach(function () {
      slack = new Slack(options);
    });

    it('should close connection to slack', function (done) {
      slack.close(done);
    });

  });

  describe('#send', function () {

    let slack;
    beforeEach(function () {
      slack = new Slack(options);
    });

    it('should send message to user', function (done) {
      slack.connect()
        .then(() => slack.send('foo'))
        .then(() => assert.called(directMessage.send))
        .then(done, done);
    });

    it('should not send message in silent mode', function (done) {
      options.silent = true;
      slack = new Slack(options);

      slack.connect()
        .then(() => slack.send('foo'))
        .then(() => assert.notCalled(directMessage.send))
        .then(done, done);
    });

    describe('should log error if cannot send message', function () {

      it('(1)', function (done) {
        client.prototype.getUserByEmail
          .returns(null);

        slack.connect()
          .then(() => slack.send('foo'))
          .then(() => assert.called(info))
          .then(() => assert.notCalled(directMessage.send))
          .then(done, done);
      });

      it('(2)', function (done) {
        delete message.ok;

        slack.connect()
          .then(() => slack.send('foo'))
          .then(() => assert.called(info))
          .then(() => assert.notCalled(directMessage.send))
          .then(done, done);
      });

      it('(3)', function (done) {
        directMessage.send.throws('TypeError');

        slack.connect()
          .then(() => slack.send('foo'))
          .catch(e => assert.match(e.message, 'TypeError'))
          .then(() => assert.called(info))
          .then(done, done);
      });

    });

  });

});
