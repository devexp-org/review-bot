'use strict';

import webhook from '../../webhooks/pull_request';
import modelMock from '../../../model/__mocks__/index';
import pullRequestMock from '../../../model/__mocks__/pull_request';
import loggerMock from '../../../logger/__mocks__/index';
import eventsMock from '../../../events/__mocks__/index';
import githubMock from '../../../pull-request-github/__mocks__/index';

describe('services/pull-request-github/webhooks/pull_request', () => {

  let payload, imports, model, github, logger, events;
  let promise, pullRequest;

  beforeEach(function () {
    model = modelMock();
    github = githubMock();
    logger = loggerMock();
    events = eventsMock();

    imports = { model, github, logger, events };

    payload = {
      id: 123456789,
      action: 'pull_request',
      pull_request: {
        title: 'The Ultimate Question of Life, the Universe, and Everything',
        number: 42,
        html_url: 'http://'
      },
      repository: {
        full_name: 'devexp-org/devexp',
        owner: {
          login: 'Abcde'
        }
      }
    };

    pullRequest = pullRequestMock();

    promise = function (x) {
      return Promise.resolve(x);
    };

    model.get('pull_request')
      .findById.returns(promise(pullRequest));

    github
      .loadPullRequestFiles.returns(promise([]));
  });

  it('should trigger system event `github:pull_request`', function (done) {
    webhook(payload, imports)
      .then(() => {
        events.emit.calledWith('github:pull_requset');
        done();
      })
      .catch(done);
  });

  it('should create new object if pull request is not found', function (done) {
    model.get('pull_request')
      .findById.returns(promise(null));

    webhook(payload, imports)
      .then(() => done())
      .catch(done);
  });

});
