export function setupSchema() {

  /**
   * Nested schema for reviewers list item.
   * @type {Object}
   */
  const Reviewer = {
    login: String,
    rank: Number,
    html_url: String,
    avatar_url: String,
    approved: {
      type: Boolean,
      'default': false
    }
  };

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
      full_name: String
    },
    organization: {
      id: Number,
      login: String,
      html_url: String,
      avatar_url: String
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
      reviewers: [Reviewer],
      started_at: Date,
      updated_at: Date,
      completed_at: Date
    }
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
      .sort('-updated_at')
      .exec();
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
      .sort('-updated_at')
      .exec();
  };

  /**
   * Find pull request by number and repository
   *
   * @param {Number} number - pull request number
   * @param {String} fullName - repository full name
   *
   * @return {Promise}
   */
  model.statics.findByNumberAndRepository = function (number, fullName) {
    return this
      .model(modelName)
      .findOne({ number, 'repository.full_name': fullName });
  };

  /**
   * Find open reviews by reviewer
   *
   * @param {String} login
   * @return {Promise}
   */
  model.statics.findOpenReviewsByUser = function (login) {
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
