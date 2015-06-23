import React from 'react';

import Avatar from 'app/client/components/avatar/avatar.jsx';

export default class ReviewCard {
    render() {
        var pullRequest = this.props.pullRequest;

        if (!pullRequest) return null;

        return (
            <div className='review-card'>
                <div className="row">
                    <div className='col-xs-2 col-md-2 hidden-xs'>
                        <Avatar img={ pullRequest.user.avatar_url }/>
                    </div>
                    <div className='col-xs-12 col-md-10'>
                        <h3 className='review-card__title'>Review of pull request: "{ pullRequest.title }"</h3>
                        <div className='review-card__labels text-muted'>
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
                            <button
                                className='btn btn-primary'
                                onClick={ this.props.chooseReviewersClick }>
                                    Choose reviewers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
