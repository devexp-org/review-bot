import alt from 'app/client/alt';
import ReviewActions from 'app/client/actions/review';

class ReviewersStore {
    constructor() {
        this.bindListeners({
            onChooseReviewers: ReviewActions.chooseReviewers,
            onReviewersChosen: ReviewActions.reviewersChosen,
            onChooseReviewersFailed: ReviewActions.failed,
            onAssign: ReviewActions.assign
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

    onAssign(index) {
        var assignedReviewers = this.assignedReviewers || [],
            suggestedReviewers = this.suggestedReviewers,
            reviewer;

        reviewer = suggestedReviewers.splice(index, 1);
        assignedReviewers.push(reviewer[0]);

        this.setState({
            suggestedReviewers,
            assignedReviewers
        });
    }
}

export default alt.createStore(ReviewersStore, 'ReviewersStore');
