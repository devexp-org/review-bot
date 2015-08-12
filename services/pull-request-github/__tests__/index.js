'use strict';

import { PullRequestGitHub } from '../../pull-request-github';

describe('services/pull-request-github', function () {

  let github, model, options;

  beforeEach(function () {
    model = sinon.stub();
    github = sinon.stub();
    options = {
      separator: {
        top: '<div id="top"></div>',
        bottom: '<div id="bottom"></div>'
      }
    };
  });

  it('should be able to clean pull request body from old content', function () {
    const gpr = new PullRequestGitHub(model, github, options);
    const body = `
BODY TEXT
<div id="top"></div>
EXTRA BODY TEXT
<div id="bottom"></div>
`;

    const result = gpr.cleanPullRequestBody(body);

    assert.equal(result, 'BODY TEXT');
  });

  it('should be able to replace pull request body', function () {
    const gpr = new PullRequestGitHub(model, github, options);
    const body = `
BODY TEXT
<div id="top"></div>
<div>EXTRA BODY TEXT</div>
<div id="bottom"></div>
`;

    const pullRequest = {
      body: body,
      section: {
        id1: 'ID1',
        id2: 'ID2'
      }
    };

    gpr.fillPullRequestBody(pullRequest);

    const expected = 'BODY TEXT'
                   + '<div id="top"></div>'
                   + '<div>ID1</div>'
                   + '<div>ID2</div>'
                   + '<div id="bottom"></div>';

    assert.equal(pullRequest.body, expected);
  });

});
