import github from 'app/modules/github/api';
import badges from 'app/modules/badges';
import events from 'app/modules/events';

/**
 * Maps review status to color.
 *
 * @param {String} status
 *
 * @returns {String}
 */
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

/**
 * Maps review status to badge title.
 *
 * @param {String} status
 *
 * @returns {String}
 */
function statusToTitle(status) {
    switch (status) {
        case 'inprogress':
            return 'in progress';
        case 'notstarted':
            return 'not started';
        default:
            return status;
    }
}

/**
 * Creates review status badge.
 *
 * @param {Object} review
 * @param {String} review.status
 *
 * @returns {String}
 */
function reviewStatusBadge(review) {
    return badges.create('review', statusToTitle(review.status), statusToColor(review.status));
}

/**
 * Creates reviewer badge.
 *
 * @param {Object} reviewer
 * @param {String} reviewer.login
 * @param {Boolean} reviewer.approved
 * @param {String} reviewer.html_url
 *
 * @returns {String}
 */
function reviewerBadge(reviewer) {
    return badges.create(
        reviewer.login,
        reviewer.approved ? 'ok' : '...',
        reviewer.approved ? 'green' : 'yellow',
        reviewer.html_url
    );
}

/**
 * Concat review status badge and reviewers badges.
 *
 * @param {Object} review
 *
 * @returns {String}
 */
function buildReviewBadges(review) {
    var status = reviewStatusBadge(review);
    var reviewers = review.reviewers.map(reviewerBadge).join(' ');

    return '<div>' + status + ' ' + reviewers + '</div>';
}

/**
 * Calls method for updateing pull request body with review badges.
 *
 * @param {Object} payload
 */
function updateReviewBadges(payload) {
    github.setBodyContent(
        payload.pullRequest.id,
        'review:badge',
        buildReviewBadges(payload.review)
    );
}

/**
 * Subscribe on events for creating review badges.
 */
export default function reviewBadgesPluginCreator() {
    events.on('review:updated', updateReviewBadges);
    events.on('review:started', updateReviewBadges);
    events.on('review:approved', updateReviewBadges);
    events.on('review:complete', updateReviewBadges);
}
