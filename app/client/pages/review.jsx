import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import PullRequestStore from 'app/client/stores/pull_request';
import PullRequestsActions from 'app/client/actions/pull_requests';
import ReviewActions from 'app/client/actions/review';
import ReviewersStore from 'app/client/stores/reviewers';

import Loader from 'app/client/components/loader.jsx';
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
            content,
            review;

        if (!pullRequest) {
            content = (
                <div>Pull request not found!</div>
            );
        } else {
            content = (
                <div className='review'>
                    <div className="row">
                        <div className='col-xs-2 col-md-2 hidden-xs'>
                            <div className='avatar -big'>
                                <img src={ pullRequest.user.avatar_url }/>
                            </div>
                        </div>
                        <div className='col-xs-12 col-md-10'>
                            <h3 className='review__title'>Review of pull request: "{ pullRequest.title }"</h3>
                            <div className='review__labels text-muted'>
                                <span className='label label-success'>{ pullRequest.state }</span>
                                <span> | </span>
                                <span className='label label-info'>Updated: { pullRequest.updated_at }</span>
                                <span> | </span>
                                <a href={ pullRequest.html_url } className='label label-default'>
                                    <i className='glyphicon glyphicon-comment'></i>
                                    <strong> { pullRequest.comments }</strong>
                                </a>
                            </div>
                            <p className='lead'>{ pullRequest.body }</p>
                            <div>
                                <button className='btn btn-primary' onClick={ this.chooseReviewers.bind(this) }>Choose reviewers</button>
                            </div>
                        </div>
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

                <ReviewersList list={ reviewersStore.suggestedReviewers }/>

                <Loader active={ reviewersStore.reviewersLoading } centered={ true }/>
            </div>
        )
    }
}

export default ReviewPage;
