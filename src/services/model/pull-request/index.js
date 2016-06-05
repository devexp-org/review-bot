export function setupSchema() {

  return {
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
    }
  };

}

export function setupModel(modelName, model) {

  /**
   * Set mongo id the same as pull request id.
   */
  model.virtual('id')
    .get(function () { return this._id; })
    .set(function (id) { this._id = id; });

  model.methods.toString = function () {
    return '[' + this.id + ' – ' + this.title + ']' + ' ' + this.html_url;
  };

  model.virtual('owner')
    .get(function () {
      if (this.repository &&
          this.repository.owner &&
          this.repository.owner.login) {
        return this.repository.owner.login;
      }

      return '';
    });

  /**
   * Find pull requests by user
   *
   * @param {String} login
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByUser = function (login) {
    return this
      .model(modelName)
      .find({ 'user.login': login })
      .sort('-updated_at')
      .limit(20)
      .exec();
  };

  /**
   * Find pull request by repository and number
   *
   * @param {String} fullName - repository full name
   * @param {Number} number - pull request number
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByRepositoryAndNumber = function (fullName, number) {
    return this
      .model(modelName)
      .findOne({ number, 'repository.full_name': fullName })
      .exec();
  };

}
