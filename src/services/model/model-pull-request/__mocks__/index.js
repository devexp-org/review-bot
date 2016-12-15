import { staticMock } from '../../../model/__mocks__/static';
import { instanceMock } from '../../../model/__mocks__/schema';

export function pullRequestMock(mixin) {

  const pullRequest = {
    id: 1,
    body: 'body',
    title: 'title',
    number: 2,
    html_url: 'html_url',
    state: 'open',
    head: { ref: 'head.ref', sha: 'head.sha' },
    base: { ref: 'base.ref', sha: 'base.sha' },
    user: { id: 3, login: 'user.login' },
    owner: 'repository.owner.login',
    repository: {
      id: 4,
      name: 'repository.name',
      full_name: 'repository.full_name',
      owner: {
        id: 5,
        login: 'repository.owner.login'
      }
    },
    files: []
  };

  pullRequest.toString = function () {
    return '#' + this.id;
  };

  return instanceMock(pullRequest, mixin);

}

export function pullRequestModelMock(mixinSchema, mixinModel) {

  const pullRequest = pullRequestMock(mixinSchema);

  const stub = staticMock(pullRequest);

  stub.findById = sinon.stub().returns(Promise.resolve(null));
  stub.findByUser = sinon.stub().returns(Promise.resolve([]));
  stub.findByRepositoryAndNumber = sinon.stub().returns(Promise.resolve(null));

  if (mixinModel) {
    mixinModel(stub);
  }

  return stub;

}
