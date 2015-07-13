var github = require('app/core/github/api');
var badges = require('app/core/badges');
var events = require('app/core/events');

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
    console.log(reviewer);

    return badges.create(
        reviewer.login,
        reviewer.approved ? 'ok' : '...',
        reviewer.approved ? 'green' : 'yellow',
        reviewer.html_url
    );
}

function buildReviewBadges(review) {
    var status = reviewStatusBadge(review),
        reviewers = review.reviewers.map(reviewerBadge).join(' ');

    return '<div>' + status + ' ' + reviewers + '</div>';
}

function updateReviewBadges(payload) {
    github.setBodyContent(
        payload.pullRequest.id,
        'review:badge',
        buildReviewBadges(payload.review)
    );
}

module.exports = function reviewBadgesPluginCreator() {
    events.on('review:updated', updateReviewBadges);
    events.on('review:started', updateReviewBadges);
    events.on('review:approved', updateReviewBadges);
    events.on('review:complete', updateReviewBadges);
};
