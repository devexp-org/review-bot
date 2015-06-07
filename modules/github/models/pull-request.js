var Schema = require('mongoose').Schema;

module.exports = new Schema({
    title: String,
    body: String,
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
    merged: false,
    merged_by: null,
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
