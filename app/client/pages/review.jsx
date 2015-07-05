import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';

import connectToStores from 'alt/utils/connectToStores';
import pageTitle from 'app/client/utils/page_title.jsx';
import authenticated from 'app/client/utils/authenticated.jsx';

import PullRequestsActions from 'app/client/actions/pull_requests';
import ReviewActions from 'app/client/actions/review';
import ReviewStore from 'app/client/stores/review';

import Loader from 'app/client/components/loader/loader.jsx';
import NotFound from 'app/client/components/not_found/not_found.jsx';
import ReviewCard from 'app/client/components/review/review_card.jsx';
import Reviewer from 'app/client/components/review/reviewer_type_panel.jsx';

@authenticated
@connectToStores
@pageTitle
class ReviewPage extends React.Component {
    static propTypes = {
        isAuthenticated: React.PropTypes.func.isRequired,
        params: React.PropTypes.object,
        review: React.PropTypes.object,
        user: React.PropTypes.object
    };

    static getPageTitle(nextProps) {
        if (nextProps && nextProps.review) {
            return 'Review | ' + nextProps.review.pullRequest.title;
        }

        return 'Review';
    }

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
        var user = this.props.user,
            review = this.props.review || {},
            suggestedReviewersList,
            content;

        if (!this.props.params || review.id !== parseInt(this.props.params.id, 10)) {
            content = (
                <Loader active={ true } centered={ true }/>
            );
        } else {
            content = (
                <ReviewCard isAuthenticated={ this.props.isAuthenticated } review={ review } user={ user } />
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
