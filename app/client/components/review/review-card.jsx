import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';

import ReviewActions from 'app/client/actions/review';

import Avatar from 'app/client/components/avatar/avatar.jsx';
import Button from 'app/client/components/button.jsx';
import Label from 'app/client/components/label.jsx';
import ReviewerBadge from 'app/client/components/review/reviewer_type_badge.jsx';
import TimeAgo from 'react-timeago';
import Complexity from 'app/plugins/complexity/client/components/complexity.jsx';

import statusToColor from 'app/client/utils/status_to_color_mapper';

export default class ReviewCard {
    static propTypes = {
        isAuthenticated: React.PropTypes.func,
        review: React.PropTypes.object.isRequired,
        user: React.PropTypes.object.isRequired
    };

    isReviewNeeded() {
        var login = this.props.user.login,
            pullRequest = this.props.review.pullRequest,
            reviewers = this.props.review.review.reviewers,
            isInReviewers;

        if (login === pullRequest.user.login) {
            return false;
        }

        isInReviewers = reviewers.filter((reviewer) => reviewer.login === login)[0];
        if (!isInReviewers) {
            return false;
        }

        if (isInReviewers.approved) {
            return false;
        }

        return true;
    }

    isAuthor(login) {
        return this.props.user.login === login;
    }

    onApprove(review, user) {
        ReviewActions.approve({ review, user });
    }

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
            approveBtn,
            reviewers,
            isAuthor,
            btnsList;

        if (!pullRequest) return null;

        isAuthor = this.isAuthor(pullRequest.user.login);

        // If author
        if (isAuthor) {
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
                    <Button action={ this.onSave.bind(this, review) } size='s' type='success'>
                        { saveBtnText }
                    </Button>
                );
            }

            if (review.review.changed) {
                cancelBtn = (
                    <Button action={ this.onCancelEditing.bind(this) } size='s' type='cancel'>
                        Cancel
                    </Button>
                );
            }
        } else if (this.isReviewNeeded()) { // if reviewer
            approveBtn = (
                <Button action={ this.onApprove.bind(this, review, this.props.user) } size='s' type='success'>
                    Approve
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
                                onRemoveClick={ isAuthor ? this.onRemove.bind(this, reviewer, index) : null }
                                reviewer={ reviewer } />
                        );
                    }) }
                </div>
            );
        }

        btnsList = this.props.isAuthenticated() && (
            <div>
                { approveBtn } { saveBtn } { cancelBtn } { chooseReviewersBtn }
            </div>
        );

        return (
            <div className='review-card'>
                <div className='row'>
                    <div className='col-md-2 hidden-xs hidden-sm'>
                        <Avatar img={ pullRequest.user.avatar_url }/>

                        <div className='review-card__complexity'>
                            <Complexity pull={ pullRequest }/>
                        </div>
                    </div>

                    <div className='col-xs-12 col-md-10'>
                        <h3 className='review-card__title'>
                            <a href={ pullRequest.html_url }>{ pullRequest.title }</a>
                        </h3>

                        <div className='review-card__labels text-muted'>
                            <Label type={ statusToColor(pullRequest.state) }>pr: { pullRequest.state }</Label>
                            <span> | </span>

                            <Label type={ statusToColor(review.review.status) }>
                                review: { review.review.status || 'no started yet' }
                            </Label>
                            <span> | </span>

                            <Label type='info'>updated: <TimeAgo date={ pullRequest.updated_at }/></Label>
                            <span> | </span>

                            <Label url={ pullRequest.html_url }>
                                <i className='glyphicon glyphicon-comment'></i>
                                <strong> { pullRequest.comments }</strong>
                            </Label>
                        </div>

                        <p className='lead'>{ pullRequest.body }</p>

                        { btnsList }

                        <div>
                            { reviewers }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
