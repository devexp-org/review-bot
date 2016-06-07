import AbstractTransport from '../transport';

describe('services/notification/transport', function () {

  let transport;

  beforeEach(function () {
    transport = new AbstractTransport();
  });

  it('should able to send message', function () {
    transport.send('user', 'message');
  });

  it('should able to close connection', function (done) {
    transport.close(done);
  });

  it('should able to connect to server', function (done) {
    transport.connect().then(done, done);
  });

});
