'use strict';

import { withPullRequest } from './common';

describe('review', function () {

  describe('services/choose-reviewer', function () {

    it('should choose reviewers', function (done) {

      withPullRequest(imports => {

        const service = imports['choose-reviewer'];

        return service
          .review(40503811)
          .then(result => {
            assert.isArray(result.team);
            assert.lengthOf(result.team, 1);
          });

      }, done);

    });

  });

});
