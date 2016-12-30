import AbstractTransport from '../';

describe('services/notification/transport-abstract', function () {

  let transport;

  beforeEach(function () {
    transport = new AbstractTransport();
  });

  it('should able to send message', function (done) {
    transport.send('user', 'message').then(done, done);
  });

  it('should able to close connection', function (done) {
    transport.close().then(done, done);
  });

  it('should able to connect to server', function (done) {
    transport.connect().then(done, done);
  });

});
