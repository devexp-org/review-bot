import { get } from 'lodash';
import service from '../../review-autoassign';

describe('service/review-autoassign', function () {

  let options, imports, payload, reviewResult;

  beforeEach(function () {

    options = {};

    imports = {
      logger: {
        info: sinon.stub(),
        error: sinon.stub()
      },
      events: {
        on: sinon.stub()
      },
      'choose-reviewer': {
        review: sinon.stub()
      },
      'pull-request-action': {
        save: sinon.stub()
      }
    };

    payload = {
      pullRequest: {
        id: 1,
        title: 'title',
        review: {
          reviewers: []
        },
        get(path) {
          return get(this, path);
        }
      }
    };

    reviewResult = {
      team: ['Captain America', 'Hawkeye']
    };

    imports.events.on
      .withArgs('github:pull_request:opened').callsArgWith(1, payload);
    imports.events.on
      .withArgs('github:pull_request:synchronize').callsArgWith(1, payload);

    imports['choose-reviewer'].review
      .withArgs(1).returns(Promise.resolve(reviewResult));

  });

  it('should start review when someone open a new pull request', function (done) {

    service(options, imports);

    setTimeout(function () {
      assert.calledWithExactly(
        imports['pull-request-action'].save,
        { reviewers: reviewResult.team },
        1
      );
      done();
    }, 10);

  });

  it('should not restart if reviewer were selected before', function () {

    payload.pullRequest.review.reviewers = [{ login: 'Hulk' }];

    service(options, imports);

    assert.notCalled(imports['pull-request-action'].save);

  });

});
