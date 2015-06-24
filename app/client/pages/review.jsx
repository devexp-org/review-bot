import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';
import connectToStores from 'alt/utils/connectToStores';

import PullRequestsActions from 'app/client/actions/pull_requests';
import ReviewActions from 'app/client/actions/review';
import ReviewStore from 'app/client/stores/review';

import Loader from 'app/client/components/loader/loader.jsx';
import ReviewCard from 'app/client/components/review-card/review-card.jsx';
import Reviewer from 'app/client/components/reviewer/reviewer-panel.jsx';

@connectToStores
class ReviewPage extends React.Component {
    static getStores() {
        return [ReviewStore];
    }

    static getPropsFromStores() {
        return ReviewStore.getState();
    }

    componentWillMount() {
        PullRequestsActions.loadPull(this.props.params.id);
    }

    assignReviewer(index) {
        ReviewActions.assignReviewer(index);
    }

    render() {
        var review = this.props.review || {},
            pullRequest = review.pullRequest,
            suggestedReviewersList,
            content,
            review;

        if (!this.props.params || review.id != this.props.params.id) {
            content = (
                <Loader active={ true } centered={ true }/>
            );
        } else {
            content = (
                <ReviewCard review={ review } />
            );
        }

        if (!isEmpty(review.suggestedReviewers)) {
            suggestedReviewersList = (
                <div>
                    <h4>Suggested Reviewers</h4>
                    <div className="reviewers-list">
                        { review.suggestedReviewers.map((reviewer, index) => {
                            return (
                                <Reviewer
                                    reviewer={ reviewer }
                                    onClick={ this.assignReviewer.bind(this, index) }/>
                            );
                        }) }
                    </div>
                </div>
            );
        }

        return (
            <div>
                <div className='panel panel-default'>
                    <div className='panel-body'>
                        { content }
                    </div>
                </div>

                { suggestedReviewersList }

                <Loader active={ review.reviewersLoading } centered={ true }/>
            </div>
        )
    }
}

export default ReviewPage;
