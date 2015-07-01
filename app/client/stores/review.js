import clone from 'lodash/lang/clone';

import alt from 'app/client/alt';

import ReviewActions from 'app/client/actions/review';
import PullRequestActions from 'app/client/actions/pull_requests';

class ReviewStore {
    constructor() {
        this.bindListeners({
            onPullRequestLoaded: PullRequestActions.pullLoaded,
            onChooseReviewers: ReviewActions.chooseReviewers,
            onReviewersChosen: ReviewActions.reviewersChosen,
            onChooseReviewersFailed: ReviewActions.choosingReviewersFailed,
            onRemoveReviewer: ReviewActions.removeReviewer,
            onAssign: ReviewActions.assignReviewer,
            onApprove: ReviewActions.approve,
            onCancel: ReviewActions.cancel,
            onSave: ReviewActions.save
        });
    }

    onPullRequestLoaded(pullRequest) {
        pullRequest.review.reviewers = pullRequest.review.reviewers || [];

        var review = {
            id: pullRequest._id,
            origReview: clone(pullRequest.review, true),
            review: pullRequest.review,
            suggestedReviewers: [],
            origSuggestedReviewers: [],
            pullRequest
        };

        this.setState({ review });
    }

    onChooseReviewers() {
        var review = this.review;

        review.reviewersLoading = true;
        review.reviewersNotFound = false;

        this.setState({ review });
    }

    onReviewersChosen(suggestedReviewers) {
        var review = this.review;

        if (suggestedReviewers.length === 0) {
            review.reviewersNotFound = true;
        }

        review.reviewersLoading = false;
        review.suggestedReviewers = suggestedReviewers;
        review.origSuggestedReviewers = clone(suggestedReviewers, true);

        this.setState({ review });
    }

    onChooseReviewersFailed() {
        var review = this.review;

        review.reviewersLoading = false;

        this.setState({ review });
    }

    onAssign(index) {
        var review = this.review,
            reviewInfo = review.review,
            suggestedReviewers = review.suggestedReviewers,
            reviewer = suggestedReviewers.splice(index, 1)[0];

        reviewer.index = index;
        reviewInfo.changed = true;
        reviewInfo.reviewers.push(reviewer);

        this.setState({ review });
    }

    onRemoveReviewer(data) {
        var review = this.review,
            reviewInfo = review.review,
            reviewers = reviewInfo.reviewers;

        reviewers.splice(data.index, 1);

        reviewInfo.changed = true;

        if (data.reviewer.index >= 0) {
            review.suggestedReviewers.splice(data.reviewer.index, 0, data.reviewer);
        }

        this.setState({ review });
    }

    onCancel() {
        var review = this.review;

        review.review = clone(review.origReview, true);
        review.suggestedReviewers = clone(review.origSuggestedReviewers, true);

        this.setState({ review });
    }

    onSave() {
        var review = this.review;

        review.origReview = clone(review.review, true);
        review.suggestedReviewers = [];
        review.origSuggestedReviewers = [];
        review.review.changed = false;

        this.setState({ review });
    }

    onApprove(data) {
        var review = this.review;

        review.review.reviewers.forEach((reviewer) => {
            if (reviewer.login === data.user.username) {
                reviewer.approved = true;
            }
        });

        this.setState({ review });
    }
}

export default alt.createStore(ReviewStore, 'ReviewStore');
