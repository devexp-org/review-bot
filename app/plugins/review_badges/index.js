import github from 'app/core/github/api';
import badges from 'app/core/badges';
import events from 'app/core/events';

function statusToColor(status) {
    switch (status) {
        case 'inprogress':
            return 'yellow';
        case 'complete':
            return 'green';
        default:
            return 'lightgrey';
    }
}

function reviewStatusBadge(review) {
    return badges.create('review', review.status, statusToColor(review.status));
}

function reviewerBadge(reviewer) {
    return badges.create(
        reviewer.login,
        reviewer.aproved ? 'ok' : '...',
        reviewer.aproved ? 'green' : 'yellow',
        reviewer.html_url
    );
}

function buildReviewBadges(review) {
    var status = reviewStatusBadge(review),
        reviewers = review.reviewers.map(reviewerBadge).join(' ');

    return '<div>' + status + ' ' + reviewers + '</div>';
}

function updateReviewBadges({ pullRequest, review }) {
    github.setBodyContent(
        pullRequest.id,
        'review:badge',
        buildReviewBadges(review)
    );
}

export default function reviewBadgesPluginCreator() {
    events.on('review:updated', updateReviewBadges);
    events.on('review:started', updateReviewBadges);
    events.on('review:approved', updateReviewBadges);
    events.on('review:complete', updateReviewBadges);
}
