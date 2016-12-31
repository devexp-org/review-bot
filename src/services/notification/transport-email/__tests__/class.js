import proxyquire from 'proxyquire';
import loggerMock from '../../../logger/__mocks__/';
import mailerStub from '../__mocks__/mailer';

describe('services/notification/transport-slack/class', function () {

  let options, logger, mailer, email, Email;

  beforeEach(function () {

    logger = loggerMock();

    mailer = mailerStub();

    Email = proxyquire('../class', {
      nodemailer: mailer
    }).default;

    options = { host: 'example.com', token: 'token' };

    email = new Email(logger, options);

  });

  describe('#connect', function () {

    it('should setup nodemailer', function (done) {
      email.connect()
        .then(() => assert.called(mailer.createTransport))
        .then(done, done);
    });

  });

  describe('#send', function () {

    it('should send message to user', function (done) {
      email.connect()
        .then(() => email.send({ login: 'user' }, 'message'))
        .then(() => assert.called(mailer.sendMail))
        .then(done, done);
    });

    it('should not send message in silent mode', function (done) {
      options.silent = true;
      email = new Email(logger, options);

      email.connect()
        .then(() => email.send({ login: 'user' }, 'message'))
        .then(() => assert.notCalled(mailer.sendMail))
        .then(done, done);
    });

    it('should log error if cannot send message', function (done) {
      mailer.sendMail
        .callsArgWith(1, new Error());

      email.connect()
        .then(() => email.send({ login: 'user' }, 'message'))
        .then(() => assert.called(logger.error))
        .then(done, done);
    });

  });

});
