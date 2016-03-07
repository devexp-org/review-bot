'use strict';

import { PullRequestGitHub } from '../../pull-request-github';

describe('services/pull-request-github', () => {

  let github, model, options;

  beforeEach(() => {
    model = sinon.stub();
    github = sinon.stub();
    options = {
      separator: {
        top: '<div id="top"></div>',
        bottom: '<div id="bottom"></div>'
      }
    };
  });

  it('should be able to clean pull request body from old content', () => {
    const gpr = new PullRequestGitHub(model, options, { github });
    const body = `
BODY TEXT
<div id="top"></div>
EXTRA BODY TEXT
<div id="bottom"></div>
`;

    const result = gpr.cleanPullRequestBody(body);

    assert.equal(result, 'BODY TEXT');
  });

  it('should be able to replace pull request body', () => {
    const gpr = new PullRequestGitHub(model, options, { github });
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

    const expected = 'BODY TEXT' +
                     '<div id="top"></div>' +
                     '<div>ID1</div>' +
                     '<div>ID2</div>' +
                     '<div id="bottom"></div>';

    assert.equal(pullRequest.body, expected);
  });

  describe('#buildBodyContent', () => {
    const sections = {
      id1: 'content 1',
      id2: {
        pos: 1,
        content: 'content 2'
      },
      id3: {
        pos: 10,
        content: 'content 3'
      }
    };

    it('should put sections in correct order in body content', () => {
      const gpr = new PullRequestGitHub(model, options, { github });

      assert.equal(gpr.buildBodyContent(sections), '<div>content 2</div><div>content 3</div><div>content 1</div>');
    });
  });

});
