import { staticMock } from '../../../model/__mocks__/static';
import { instanceMock } from '../../../model/__mocks__/schema';

export function userMock() {
  const user = { login: 'testuser', contacts: [] };

  return instanceMock(user);
}

export function userModelMock() {
  const user = userMock();
  const stub = staticMock(user);

  stub.findByLogin = sinon.stub().returns(Promise.resolve(null));

  return stub;
}
