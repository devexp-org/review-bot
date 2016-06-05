import { get } from 'lodash';

export function pullRequestMock(mixin) {

  const pullRequest = {
    id: 1,
    _id: 1,
    body: 'body',
    title: 'title',
    number: 2,
    html_url: 'html_url',
    state: 'open',
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
    files: [],
    review: {
      status: 'notstarted',
      reviewers: []
    }
  };

  pullRequest.get = function () {};
  pullRequest.set = sinon.stub().returnsThis();
  pullRequest.save = sinon.stub().returns(Promise.resolve(pullRequest));

  sinon.stub(pullRequest, 'get', function (path) {
    return get(this, path);
  });

  if (mixin) {
    mixin(pullRequest);
  }

  return pullRequest;

}

export function pullRequestModelMock(mixin) {

  const stub = function () {
    return pullRequestMock(mixin);
  };

  stub.findById = sinon.stub().returns(Promise.resolve());
  stub.findByUser = sinon.stub().returns(Promise.resolve());
  stub.findInReview = sinon.stub().returns(Promise.resolve());
  stub.findByReviewer = sinon.stub().returns(Promise.resolve());
  stub.findInReviewByReviewer = sinon.stub().returns(Promise.resolve());
  stub.findByRepositoryAndNumber = sinon.stub().returns(Promise.resolve());

  return stub;

}
