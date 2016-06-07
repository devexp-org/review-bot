import proxyquire from 'proxyquire';
import loggerMock from '../../logger/__mocks__/';
import slackClientStub from '../__mocks__/slack-client';

describe('services/slack/class', function () {

  let options, logger, slack, Slack, client;

  beforeEach(function () {

    logger = loggerMock();

    client = slackClientStub();

    Slack = proxyquire('../class', {
      '@slack/client': {
        RtmClient: client,
        MemoryDataStore: sinon.stub()
      }
    }).default;

    options = { host: 'example.com', token: 'token' };

    slack = new Slack(logger, options);
  });

  describe('#constructor', function () {

    it('should return Slack', function () {
      assert.property(slack, 'send');
      assert.property(slack, 'close');
      assert.property(slack, 'connect');
    });

    it('should throw an error if token is not set', function () {
      assert.throws(() => new Slack(logger, {}), /token/);
    });

  });

  describe('#connect', function () {

    it('should initiate connection to slack', function (done) {
      slack.connect()
        .then(() => assert.called(client.start))
        .then(done, done);
    });

    it('should log errors', function (done) {
      client.on
        .withArgs('error')
        .callsArgWith(1, new Error());

      slack.connect()
        .then(() => assert.called(logger.error))
        .then(done, done);
    });

  });

  describe('#close', function () {

    it('should close connection to slack', function (done) {
      slack.connect()
        .then(() => slack.close(() => {
          assert.called(client.disconnect);
          done();
        }));
    });

    it('should not throw an error if client is not connect before', function (done) {
      slack.close(() => {
        assert.notCalled(client.disconnect);
        done();
      });
    });

  });

  describe('#send', function () {

    it('should send message to user', function (done) {
      slack.connect()
        .then(() => slack.send('user', 'message'))
        .then(() => assert.called(client.sendMessage))
        .then(done, done);
    });

    it('should not send message in silent mode', function (done) {
      options.silent = true;
      slack = new Slack(logger, options);

      slack.connect()
        .then(() => slack.send('user', 'message'))
        .then(() => assert.notCalled(client.sendMessage))
        .then(done, done);
    });

    describe('should log error if cannot send message', function () {

      it('(1)', function (done) {
        client.dataStore.getUserByEmail
          .returns(null);

        slack.connect()
          .then(() => slack.send('user', 'message'))
          .then(() => assert.called(logger.error))
          .then(() => assert.notCalled(client.sendMessage))
          .then(done, done);
      });

      it('(2)', function (done) {
        client.sendMessage.throws('TypeError');

        slack.connect()
          .then(() => slack.send('user', 'message'))
          .then(() => assert.called(logger.error))
          .then(done, done);
      });

      it('(3)', function (done) {
        client.dataStore.getDMByName.returns(null);

        slack.connect()
          .then(() => slack.send('user', 'message'))
          .then(() => assert.called(logger.error))
          .then(done, done);
      });

    });

  });

});
