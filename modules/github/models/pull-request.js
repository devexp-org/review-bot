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
    repository: {
        name: String,
        full_name: String,
        owner: {
            login: String
        }
    }
});

PullRequest.statics.findByPrId = function (id, cb) {
    return this.model('PullRequest').findOne({ id: id }, cb);
};

module.exports = PullRequest;
