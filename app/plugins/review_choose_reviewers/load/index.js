import _ from 'lodash';
import { PullRequest } from 'app/core/models';

/**
 * Creates review load processor.
 *
 * @param {Number} max - max rank which will be substract for amount of active reviews.
 *
 * @returns {Function}
 */
export default function reviewLoadCreator(max) {
    /**
     * Substract rank if member has some active reviews.
     *
     * @param {Object} review
     *
     * @returns {Promise}
     */
    return function reviewLoad(review) {
        return new Promise((resolve) => {
            var promiseList = [];

            review.team.forEach((member) => {
                promiseList.push(PullRequest.findOpenReviewsByUser(member.login));
            });

            Promise
                .all(promiseList)
                .then((openedReviews) => {
                    _(openedReviews).uniq(item => item.id).first().forEach((activeReview) => {
                        activeReview.review.reviewers.forEach((reviewer) => {
                            reviewer = _.find(review.team, { login: reviewer.login });

                            reviewer.rank -= max;
                        });
                    });

                    resolve(review);
                });
        });
    };
}
