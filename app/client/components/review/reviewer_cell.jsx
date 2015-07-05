import React from 'react';

import ReviewerBadge from 'app/client/components/review/reviewer_type_badge.jsx';

export default class ReviewerCell {
    static propTypes = {
        reviewers: React.PropTypes.array
    };

    render() {
        if (!this.props.reviewers) {
            return 'Not Specified';
        }

        return (
            <div className='reviewer-cell'>
                { this.props.reviewers.map((reviewer) =>
                    <ReviewerBadge key={ reviewer.login } reviewer={ reviewer } />) }
            </div>
        );
    }
}
