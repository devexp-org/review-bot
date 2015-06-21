import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import PullRequestListStore from 'app/client/stores/pull_request_list';
import PullRequestStore from 'app/client/stores/pull_request';
import PullRequestsActions from 'app/client/actions/pull_requests';
import ReviewActions from 'app/client/actions/review';

import Loader from 'app/client/components/loader.jsx';

@connectToStores
class ReviewPage extends React.Component {
    static getStores() {
        return [PullRequestStore];
    }

    static getPropsFromStores() {
        return PullRequestStore.getState();
    }

    componentWillMount() {
        PullRequestsActions.loadPull(this.props.params.id);
    }

    chooseReviewers() {
        ReviewActions.chooseReviewers(this.props.pullRequest.id);
    }

    render() {
        var pullRequest = this.props.pullRequest || {},
            content;

        if (!this.props.pullRequest) {
            content = (
                <div>Pull request not found!</div>
            );
        } else {
            content = (
                <div className='review'>
                    <div className='col-lg-2 col-md-2 col-sm-2'>
                        <div className='avatar -big'>
                            <img src={ pullRequest.user.avatar_url }/>
                        </div>
                    </div>
                    <div className='col-lg-8 col-md-8 col-sm-12'>
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
            );
        }

        return (
            <div>
                <div className='panel panel-default'>
                    <div className='panel-body'>
                        { content }
                    </div>
                </div>

                <Loader active={ true } centered={ true }/>
            </div>
        )
    }
}

export default ReviewPage;
