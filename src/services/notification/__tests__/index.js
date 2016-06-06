import service from '../';
import modelMock from '../../model/__mocks__/';
import { userMock } from '../../model/user/__mocks__/';

describe('services/notification', function () {

  let model, user, userModel, options, imports;

  beforeEach(function () {
    user = userMock();

    model = modelMock();

    user.getContacts.returns([
      { id: 'transport-a', account: 'a@host.com' },
      { id: 'transport-b', account: 'b@host.com' }
    ]);

    userModel = model('user');
    userModel.findByLogin.returns(Promise.resolve(user));

    options = {};
    imports = { model };
  });

  it('should reject promise if user not found', function (done) {
    userModel.findByLogin.returns(Promise.resolve(null));

    const notification = service(options, imports);

    notification('user', 'message')
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /not found/))
      .then(done, done);
  });

  it('should do nothing if user has no contacts', function (done) {
    user.getContacts.returns([]);

    const notification = service(options, imports);

    notification('user', 'message')
      .then(done, done);
  });

  it('should send message using the first matched transport', function (done) {

    const transportB = sinon.stub();
    const transportC = sinon.stub();
    const transportD = sinon.stub();

    imports['notification-service-transport-b'] = transportB;
    imports['notification-service-transport-c'] = transportC;
    imports['notification-service-transport-d'] = transportD;

    const notification = service(options, imports);

    notification('user', 'message')
      .then(() => assert.called(transportB))
      .then(() => assert.notCalled(transportC))
      .then(() => assert.notCalled(transportD))
      .then(done, done);

  });

});
