import React from 'react';

import Avatar from 'app/client/components/avatar/avatar.jsx';
import ReviewerBadge from 'app/client/components/review/reviewer_type_badge.jsx';

export default class ReviewerCell {
    render() {
        if (!this.props.reviewers) {
            return 'Not Specified';
        }

        return (
            <div className='reviewer-cell'>
                { this.props.reviewers.map((reviewer) => <ReviewerBadge reviewer={ reviewer } />) }
            </div>
        );
    }
}
