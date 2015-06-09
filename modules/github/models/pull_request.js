var Schema = require('mongoose').Schema,
    PullRequest;

PullRequest = new Schema({
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
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    head: Schema.Types.Mixed
});

PullRequest.statics.findById = function (id, cb) {
    return this.model('PullRequest').findOne({ id: id }, cb);
};

PullRequest.statics.findByNumberAndRepo = function (number, fullName, cb) {
    return this.model('PullRequest').findOne({
        number: number,
        'head.repo.full_name': fullName
    }, cb);
};

module.exports = PullRequest;
