import { cloneDeep } from 'lodash';
import { merge, withApp, withInitial } from '../app';
import { withCommand } from '../command';
import { withModelSuite } from '../model';
import { withTeamManagerSuite } from '../team-manager';
import { withPullRequestReview } from '../pull-request-review';

import issueCommentHook from '../data/issue_comment_webhook';

export function withCommandAdd(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        command: {
          options: {
            commands: { add: 'command-add' }
          },
          dependencies: [
            'command-add'
          ]
        },
        'command-add': {
          path: './src/services/command/command-add',
          dependencies: [
            'events',
            'logger',
            'team-manager',
            'pull-request-review'
          ]
        }
      }
    });

    next(test, config, done);

  };

}

describe('services/command/command-add', function () {

  const test = withCommandAdd(
    withCommand(
      withPullRequestReview(
        withTeamManagerSuite(
          withModelSuite(
            withInitial(
              withApp
            )
          )
        )
      )
    )
  );

  it('should add a new reviewer', function (done) {

    test(imports => {
      const payload = cloneDeep(issueCommentHook);

      const events = imports.events;
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      payload.pullRequest = pullRequest;
      payload.comment.body = '/add bar';

      return events
        .emitAsync('github:issue_comment', payload)
        .then(() => PullRequestModel.findById(pullRequest.id))
        .then(pullRequestLoaded => {
          const reviewers = pullRequestLoaded.get('review.reviewers');
          assert.lengthOf(reviewers, 2);
          assert.isObject(reviewers[1]);
          assert.equal(reviewers[1].login, 'bar');
        });
    }, {}, done);

  });

});
