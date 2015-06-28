import _ from 'lodash';

export default function () {
    return function removeAlreadyReviewers(review) {
        return new Promise(function (resolve) {
            var reviewers = review.pull.review.reviewers;

            if (_.isEmpty(reviewers)) {
                resolve(review);
            }

            review.team = _.filter(review.team, (member) => {
                var keep = true;

                reviewers.forEach((reviewer) => {
                    if (reviewer.login === member.login) {
                        keep = false;

                        return false;
                    }
                });

                return keep;
            });

            resolve(review);
        });
    };
}
