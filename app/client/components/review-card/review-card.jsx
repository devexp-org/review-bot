import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';

import ReviewActions from 'app/client/actions/review';

import Avatar from 'app/client/components/avatar/avatar.jsx';
import ReviewerBadge from 'app/client/components/reviewer/reviewer-badge.jsx';

export default class ReviewCard {
    onRemove(reviewer, index) {
        ReviewActions.removeReviewer({ reviewer, index });
    }

    onChooseReviewers() {
        ReviewActions.chooseReviewers(this.props.review.id);
    }

    onCancelEditing() {
        ReviewActions.cancel(this.props.review.id);
    }

    onSave(review) {
        ReviewActions.save(review);
    }

    render() {
        var review = this.props.review,
            pullRequest = review.pullRequest,
            chooseReviewersBtn,
            saveBtn, saveBtnText,
            cancelBtn,
            reviewers;

        if (!pullRequest) return null;

        if (isEmpty(review.suggestedReviewers) && !review.review.changed) {
            chooseReviewersBtn = (
                <button
                    className='btn btn-primary btn-sm'
                    onClick={ this.onChooseReviewers.bind(this) }>
                        Choose reviewers
                </button>
            );
        }

        if (review.review.changed && !isEmpty(review.review.reviewers)) {
            if (isEmpty(review.origReview.reviewers)) {
                saveBtnText = 'Start Review';
            } else {
                saveBtnText = 'Update Review';
            }

            saveBtn = (
                <button
                    className='btn btn-success btn-sm'
                    onClick={ this.onSave.bind(this, review) }>
                        { saveBtnText }
                </button>
            );
        }

        if (!isEmpty(review.review.reviewers)) {
            reviewers = (
                <div>
                    <h5>Reviewers:</h5>
                    { review.review.reviewers.map((reviewer, index) => {
                        return (
                            <ReviewerBadge
                                onRemoveClick={ this.onRemove.bind(this, reviewer, index) }
                                reviewer={ reviewer } />
                        );
                    }) }
                </div>
            );
        }

        if (review.review.changed) {
            cancelBtn = (
                <button
                    className='btn btn-cancel btn-sm'
                    onClick={ this.onCancelEditing.bind(this) }>
                        Cancel
                </button>
            );
        }

        return (
            <div className='review-card'>
                <div className='row'>
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
                            <a className='label label-default' href={ pullRequest.html_url }>
                                <i className='glyphicon glyphicon-comment'></i>
                                <strong> { pullRequest.comments }</strong>
                            </a>
                        </div>
                        <p className='lead'>{ pullRequest.body }</p>
                        <div>
                            { saveBtn } { cancelBtn } { chooseReviewersBtn }
                        </div>
                        <div>
                            { reviewers }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
