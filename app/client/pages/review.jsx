import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import PullRequestStore from 'app/client/stores/pull_request';
import PullRequestsActions from 'app/client/actions/pull_requests';
import ReviewActions from 'app/client/actions/review';
import ReviewersStore from 'app/client/stores/reviewers';

import Loader from 'app/client/components/loader/loader.jsx';
import ReviewCard from 'app/client/components/review-card/review-card.jsx';
import ReviewersList from 'app/client/components/reviewers-list/reviewers-list.jsx';

@connectToStores
class ReviewPage extends React.Component {
    static getStores() {
        return [PullRequestStore, ReviewersStore];
    }

    static getPropsFromStores() {
        return {
            pullRequestStore: PullRequestStore.getState() || {},
            reviewersStore: ReviewersStore.getState() || {}
        };
    }

    componentWillMount() {
        PullRequestsActions.loadPull(this.props.params.id);
    }

    chooseReviewers() {
        ReviewActions.chooseReviewers(this.props.pullRequestStore.pullRequest.id);
    }

    render() {
        var reviewersStore = this.props.reviewersStore,
            pullRequest = this.props.pullRequestStore.pullRequest,
            suggestedReviewersList,
            content,
            review;

        if (!pullRequest) {
            content = (
                <div>Pull request not found!</div>
            );
        } else {
            content = (
                <ReviewCard
                    pullRequest={ pullRequest }
                    chooseReviewersClick={ this.chooseReviewers.bind(this) } />
            );
        }

        if (reviewersStore.suggestedReviewers) {
            suggestedReviewersList = (
                <div>
                    <h4>Suggested Reviewers</h4>
                    <ReviewersList list={ reviewersStore.suggestedReviewers }/>
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

                <Loader active={ reviewersStore.reviewersLoading } centered={ true }/>
            </div>
        )
    }
}

export default ReviewPage;
