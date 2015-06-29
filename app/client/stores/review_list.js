import alt from 'app/client/alt';

import ReviewActions from 'app/client/actions/review';

import splitByRepo from 'app/client/utils/split_by_repo';

class ReviewListStore {
    constructor() {
        this.bindListeners({
            onReviewsLoaded: ReviewActions.userReviewsLoaded,
            onLoadUserReviews: ReviewActions.loadUserReviews,
            onFailed: ReviewActions.loadingReviewsFailed
        });
    }

    onLoadUserReviews() {
        this.setState({ loading: true });
    }

    onReviewsLoaded(reviews) {
        reviews = splitByRepo(reviews);

        this.setState({ reviews, loading: false });
    }

    onFailed() {
        this.setState({ loading: false });
    }
}

export default alt.createStore(ReviewListStore, 'ReviewListStore');
