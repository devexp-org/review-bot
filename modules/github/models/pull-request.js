var Schema = require('mongoose').Schema;

module.exports = new Schema({
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
