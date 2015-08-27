import service from '../../github';

describe('service/github', function () {

  it('should be resolved to GitHub', function (done) {

    const options = {
      version: '3.0.0'
    };

    service(options)
      .then(result => {
        const github = result.service;

        assert.property(github, 'repos');
        assert.property(github, 'pullRequests');

        done();
      })
      .catch(done);

  });

  it('should authenticate to GitHub if credentials is provided', function (done) {
    const options = {
      version: '3.0.0',
      authenticate: {
        type: 'token',
        token: '1234567890abcde'
      }
    };

    service(options)
      .then(result => {
        const github = result.service;
        assert.isObject(github);
        done();
      })
      .catch(done);

  });

});
