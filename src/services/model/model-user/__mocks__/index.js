import { get } from 'lodash';

export function userMock() {

  const user = { login: 'testuser', contacts: [] };

  user.get = function () {};
  user.set = sinon.stub().returnsThis();
  user.save = sinon.stub().returns(Promise.resolve(user));
  user.validate = sinon.stub().returns(Promise.resolve(user)),

  user.getContacts = sinon.stub().returns([]);

  sinon.stub(user, 'get', function (path) {
    return get(this, path);
  });

  return user;

}

export function userModelMock() {

  const user = userMock();

  const stub = sinon.stub().returns(user);

  stub.findByLogin = sinon.stub().returns(Promise.resolve(null));

  return stub;

}
