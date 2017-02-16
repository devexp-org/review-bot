import { merge, withApp, withInitial } from '../app';
import { withModel } from '../model';
import { withTeamModel } from '../model/model-team';
import { withUserModel } from '../model/model-user';
import { withPullRequestModel } from '../model/model-pull-request';
import { withPullRequestReview } from '../pull-request-review';
import { withTeamManager } from '../team-manager';
import { withGitHub } from '../github';

export function withReview(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        review: {
          path: './src/services/review',
          options: {
            steps: {
              preferred: 'review-step-preferred',
              'remove-author': 'review-step-remove-author',
              'remove-reviewers': 'review-step-remove-reviewers',
              load: 'review-step-load',
              random: 'review-step-random',
              total: 'review-step-total',
              commiters: 'review-step-commiters'
            },
            stepsOptions: {
              load: { max: 5 },
              random: { max: 5 },
              commiters: {
                max: 5,
                since: [5, 'month'],
                filesToCheck: 5,
                commitsCount: 10
              }
            },
            approveCount: 2,
            defaultSteps: [
              'preferred',
              'remove-author',
              'remove-reviewers',
              'load',
              'random',
              'commiters',
              'total'
            ]
          },
          dependencies: [
            'logger',
            'team-manager',
            'review-step-preferred',
            'review-step-remove-author',
            'review-step-remove-reviewers',
            'review-step-load',
            'review-step-random',
            'review-step-total',
            'review-step-commiters'
          ]
        },
        'review-step-preferred': {
          path: './src/services/review/step-preferred',
          dependencies: [
            'logger',
            'team-manager'
          ]
        },
        'review-step-remove-author': {
          path: './src/services/review/step-remove-author'
        },
        'review-step-remove-reviewers': {
          path: './src/services/review/step-remove-reviewers'
        },
        'review-step-ignore': {
          path: './src/services/review/step-ignore'
        },
        'review-step-random': {
          path: './src/services/review/step-random'
        },
        'review-step-load': {
          path: './src/services/review/step-load',
          dependencies: [
            'model'
          ]
        },
        'review-step-commiters': {
          path: './src/services/review/step-commiters',
          dependencies: [
            'logger',
            'github'
          ]
        },
        'review-step-total': {
          path: './src/services/review/step-total'
        }
      }
    });

    next(test, config, done);

  };

}

export function withReviewSuite(next) {
  return withReview(withGitHub(next));
}

describe('services/review', function () {

  const test = withReview(
    withPullRequestReview(
      withTeamManager(
        withTeamModel(
          withUserModel(
            withPullRequestModel(
              withModel(
                withInitial(
                  withGitHub(
                    withApp
                  )
                )
              )
            )
          )
        )
      )
    )
  );

  describe('#choose', function () {

    it('should return new reviewers', function (done) {

      test(imports => {
        const review = imports.review;
        const pullRequest = imports.pullRequest;

        return review.choose(pullRequest)
          .then(result => {
            assert.isArray(result.reviewers);
            assert.lengthOf(result.reviewers, 1);
            assert.property(result.reviewers[0], 'login', 'bar');
          });
      }, {}, done);

    });

  });
});
