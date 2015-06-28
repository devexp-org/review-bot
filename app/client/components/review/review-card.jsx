import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';

import ReviewActions from 'app/client/actions/review';

import Avatar from 'app/client/components/avatar/avatar.jsx';
import Button from 'app/client/components/button.jsx';
import Label from 'app/client/components/label.jsx';
import ReviewerBadge from 'app/client/components/review/reviewer_type_badge.jsx';

export default class ReviewCard {
    static propTypes = {
        review: React.PropTypes.object.isRequired
    };

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
                <Button action={ this.onChooseReviewers.bind(this) } size='s' type='primary'>
                    Choose reviewers
                </Button>
            );
        }

        if (review.review.changed && !isEmpty(review.review.reviewers)) {
            if (isEmpty(review.origReview.reviewers)) {
                saveBtnText = 'Start Review';
            } else {
                saveBtnText = 'Update Review';
            }

            saveBtn = (
                <Button action={ this.onSave.bind(this) } size='s' type='success'>
                    { saveBtnText }
                </Button>
            );
        }

        if (!isEmpty(review.review.reviewers)) {
            reviewers = (
                <div>
                    <h5>Reviewers:</h5>
                    { review.review.reviewers.map((reviewer, index) => {
                        return (
                            <ReviewerBadge
                                key={ reviewer.login }
                                onRemoveClick={ this.onRemove.bind(this, reviewer, index) }
                                reviewer={ reviewer } />
                        );
                    }) }
                </div>
            );
        }

        if (review.review.changed) {
            cancelBtn = (
                <Button action={ this.onCancelEditing.bind(this) } size='s' type='cancel'>
                    Cancel
                </Button>
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
                            <Label type='success'>{ pullRequest.state }</Label>
                            <span> | </span>
                            <Label type='info'>Updated: { pullRequest.updated_at }</Label>
                            <span> | </span>
                            <Label url={ pullRequest.html_url }>
                                <i className='glyphicon glyphicon-comment'></i>
                                <strong> { pullRequest.comments }</strong>
                            </Label>
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
