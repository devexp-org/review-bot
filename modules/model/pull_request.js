'use strict';

import { Schema } from 'mongoose';

export function setupSchema() {
  return {
    id: Number,
    _id: Number,
    body: String,
    title: String,
    number: Number,
    html_url: String,
    state: {
      type: String,
      'enum': ['open', 'closed']
    },
    user: {
      id: Number,
      login: String,
      html_url: String,
      avatar_url: String
    },
    repository: {
      id: Number,
      name: String,
      html_url: String,
      full_name: String,
      owner: {
        id: Number,
        login: String,
        html_url: String,
        avatar_url: String
      }
    },
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    merged_by: {
      id: Number,
      login: String,
      html_url: String,
      avatar_url: String
    },
    comments: Number,
    review_comments: Number,
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    files: {
      type: Array,
      'default': []
    },
    review: {
      status: {
        type: String,
        'enum': ['notstarted', 'inprogress', 'complete'],
        'default': 'notstarted'
      },
      reviewers: Array,
      started_at: Date,
      updated_at: Date,
      completed_at: Date
    },
    section: Schema.Types.Mixed
  };
}

export function setupModel(modelName, model) {

  /**
   * Set mongo id the same as pull request id.
   *
   * @param {Number} id - pull requiest id.
   *
   * @return {Number}
   */
  model.path('id').set(function (id) {
    this._id = id;

    return id;
  });

  /**
   * Find pull requests by user
   *
   * @param {String} login
   *
   * @return {Promise}
   */
  model.statics.findByUser = function (login) {
    return this
      .model(modelName)
      .find({ 'user.login': login })
      .sort('-updated_at');
  };

  /**
   * Find pull requests by reviewer
   *
   * @param {String} login
   *
   * @return {Promise}
   */
  model.statics.findByReviewer = function (login) {
    return this
      .model(modelName)
      .find({ 'review.reviewers.login': login })
      .sort('-updated_at');
  };

  /**
   * Find pull request by repository and number
   *
   * @param {String} fullName - repository full name
   * @param {Number} number - pull request number
   *
   * @return {Promise}
   */
  model.statics.findByRepositoryAndNumber = function (fullName, number) {
    return this
      .model(modelName)
      .findOne({ number, 'repository.full_name': fullName });
  };

  /**
   * Find open reviews
   *
   * @param {String} login
   * @return {Promise}
   */
  model.statics.findInReview = function () {
    const req = {
      state: 'open',
      'review.status': 'inprogress'
    };

    return this
      .model(modelName)
      .find(req, 'review');
  };

  /**
   * Find open reviews by reviewer
   *
   * @param {String} login
   * @return {Promise}
   */
  model.statics.findInReviewByReviewer = function (login) {
    const req = {
      state: 'open',
      'review.status': 'inprogress',
      'review.reviewers.login': login
    };

    return this
      .model(modelName)
      .find(req, 'review');
  };

}

export function getUserLogin(pullRequest) {
  if (pullRequest.repository &&
      pullRequest.repository.owner &&
      pullRequest.repository.owner.login) {
    return pullRequest.repository.owner.login;
  }

  if (pullRequest.organization && pullRequest.organization.login) {
    return pullRequest.organization.login;
  }

  return '';
}
