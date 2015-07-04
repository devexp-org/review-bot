import mongoose from 'mongoose';
import * as addons from './../addons';

var Schema = mongoose.Schema,
    PullRequest,
    baseSchema;

/* eslint-disable camelcase */
baseSchema = {
    _id: Number,
    id: Number,
    title: String,
    body: String,
    extra: Schema.Types.Mixed,
    url: String,
    html_url: String,
    number: Number,
    state: {
        type: String,
        'enum': ['open', 'closed']
    },
    user: {
        login: String,
        avatar_url: String,
        url: String,
        html_url: String
    },
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    merged_by: {
        login: String,
        avatar_url: String,
        url: String,
        html_url: String
    },
    comments: Number,
    review_comments: Number,
    review: {
        status: {
            type: String,
            'enum': ['notstarted', 'inprogress', 'complete'],
            'default': 'notstarted'
        },
        reviewers: Array,
        started_at: Date,
        updated_at: Date,
        finished_at: Date
    },
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    head: Schema.Types.Mixed
};
/* eslint-enable camelcase */

/**
 * Setup model
 */

addons.setupExtenders('PullRequest', baseSchema);

PullRequest = new Schema(baseSchema);

addons.setupHooks('PullRequest', PullRequest);

/**
 * Setup properties hooks
 */

PullRequest.path('id').set(function (v) {
    this._id = v;

    return v;
});

/**
 * Model static methods
 */

/**
 * Find pull request by number and repo
 *
 * @param {Number} number
 * @param {String} fullName - repository full name
 *
 * @returns {Promise}
 */
PullRequest.statics.findByNumberAndRepo = function (number, fullName) {
    return this.model('PullRequest').findOne({
        number,
        'head.repo.full_name': fullName
    });
};

/**
 * Find pull requests by username
 *
 * @param {String} username
 *
 * @returns {Promise}
 */
PullRequest.statics.findByUsername = function (username) {
    return this.model('PullRequest').find({
        'user.login': username
    }).sort('-updated_at');
};

/**
 * Find pull requests by reviewer
 *
 * @param {String} username
 *
 * @returns {Promise}
 */
PullRequest.statics.findByReviewer = function (username) {
    return this.model('PullRequest').find({
        'review.reviewers.login': username
    }).sort('-updated_at');
};

export default mongoose.model('PullRequest', PullRequest);
