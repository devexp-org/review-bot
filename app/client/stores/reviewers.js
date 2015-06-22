import alt from 'app/client/alt';
import ReviewActions from 'app/client/actions/review';

class ReviewersStore {
    constructor() {
        this.bindListeners({
            onChooseReviewers: ReviewActions.chooseReviewers,
            onReviewersChosen: ReviewActions.reviewersChosen,
            onChooseReviewersFailed: ReviewActions.failed
        });
    }

    onChooseReviewers() {
        this.setState({
            reviewersLoading: true
        });
    }

    onReviewersChosen(suggestedReviewers) {
        this.setState({
            suggestedReviewers,
            reviewersLoading: false
        });
    }

    onChooseReviewersFailed() {
        this.setState({
            reviewersLoading: false
        });
    }
}

export default alt.createStore(ReviewersStore, 'ReviewersStore');
