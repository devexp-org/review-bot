import alt from 'client/alt';

import ReviewActions from 'client/actions/review';

import splitByRepo from 'client/utils/split_by_repo';

class ReviewListStore {
    constructor() {
        this.bindListeners({
            onReviewsLoaded: ReviewActions.userReviewsLoaded,
            onLoadUserReviews: ReviewActions.loadUserReviews,
            onFailed: ReviewActions.loadingReviewsFailed
        });
    }

    onLoadUserReviews() {
        this.setState({ loading: true, notFound: false });
    }

    onReviewsLoaded(reviews) {
        reviews = splitByRepo(reviews);

        this.setState({ reviews, loading: false });
    }

    onFailed() {
        this.setState({ reviews: {}, loading: false, notFound: true });
    }
}

export default alt.createStore(ReviewListStore, 'ReviewListStore');
