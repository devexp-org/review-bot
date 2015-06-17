import mongoose from 'mongoose';

var Schema = mongoose.Schema,
    PullRequest;

/* eslint-disable camelcase */
PullRequest = new Schema({
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
        url: String
    },
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    merged_by: {
        login: String,
        avatar_url: String,
        url: String
    },
    comments: Number,
    review_comments: Number,
    complexity: Number,
    review: {
        status: {
            type: String,
            'enum': ['notstarted', 'inprogress', 'complete']
        },
        reviewers: Array,
        started_at: Date,
        finished_at: Date
    },
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    head: Schema.Types.Mixed
});
/* eslint-enable camelcase */

PullRequest.path('id').set(function (v) {
    this._id = v;

    return v;
});

PullRequest.statics.findByNumberAndRepo = function (number, fullName) {
    return this.model('PullRequest').findOne({
        number,
        'head.repo.full_name': fullName
    });
};

PullRequest.statics.findByUsername = function (username) {
    return this.model('PullRequest').find({
        'user.login': username
    }).sort('-updated_at');
};

export default mongoose.model('PullRequest', PullRequest);
