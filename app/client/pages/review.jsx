import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';
import connectToStores from 'alt/utils/connectToStores';

import PullRequestsActions from 'app/client/actions/pull_requests';
import ReviewActions from 'app/client/actions/review';
import ReviewStore from 'app/client/stores/review';
import UserStore from 'app/client/stores/user';

import Loader from 'app/client/components/loader/loader.jsx';
import NotFound from 'app/client/components/not_found/not_found.jsx';
import ReviewCard from 'app/client/components/review/review-card.jsx';
import Reviewer from 'app/client/components/review/reviewer_type_panel.jsx';

@connectToStores
class ReviewPage extends React.Component {
    static propTypes = {
        params: React.PropTypes.object,
        review: React.PropTypes.object
    };

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
        var user = UserStore.getState().user,
            review = this.props.review || {},
            suggestedReviewersList,
            content;

        if (!this.props.params || review.id !== parseInt(this.props.params.id, 10)) {
            content = (
                <Loader active={ true } centered={ true }/>
            );
        } else {
            content = (
                <ReviewCard review={ review } user={ user } />
            );
        }

        if (!isEmpty(review.suggestedReviewers)) {
            suggestedReviewersList = (
                <div>
                    <h4>Suggested Reviewers</h4>
                    <div className='reviewers-list'>
                        { review.suggestedReviewers.map((reviewer, index) => {
                            return (
                                <Reviewer
                                    onClick={ this.assignReviewer.bind(this, index) }
                                    reviewer={ reviewer }/>
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

                <Loader active={ Boolean(review.reviewersLoading) } centered={ true }/>

                <NotFound message={ review.reviewersNotFound && 'Reviewers not found!' } />
            </div>
        );
    }
}

export default ReviewPage;
