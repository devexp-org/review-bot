import { staticMock } from '../../../model/__mocks__/static';
import { instanceMock } from '../../../model/__mocks__/schema';

export function userMock(mixin) {
  const user = { login: 'testuser', contacts: [] };

  user.getContacts = sinon.stub().returns([]);

  return instanceMock(user, mixin);
}

export function userModelMock(schemaMixin, modelMixin) {
  const user = userMock(schemaMixin);
  const stub = staticMock(user, modelMixin);

  stub.findByLogin = sinon.stub().returns(Promise.resolve(null));

  return stub;
}
