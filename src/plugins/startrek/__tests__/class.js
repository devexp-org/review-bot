import StarTrek from '../class';

describe('plugins/startrack/class', function () {

  let got, options, startrek;

  beforeEach(function () {

    got = sinon.stub();
    got.get = got.post = got.patch = got;
    got.returns(Promise.resolve());

    options = {
      url: 'http://example.com',
      token: 'token'
    };

    startrek = new StarTrek(got, options);

  });

  describe('#request', function () {

    it('should not send message in silent mode', function (done) {
      options.silent = true;

      startrek = new StarTrek(got, options);

      startrek.request('http://example.com', 'post', {})
        .then(() => assert.notCalled(got.post))
        .then(done, done);
    });

  });

  describe('#issueUpdate', function () {

    it('should make a right request', function (done) {
      const issue = 'TASK-1';
      const payload = { field: { add: ['value1', 'value2'] } };

      startrek.issueUpdate(issue, payload)
        .then(() => {
          const url = 'http://example.com/issues/TASK-1';
          assert.calledWithMatch(got.patch, url, {
            body: '{"field":{"add":["value1","value2"]}}',
            headers: {
              Authorization: 'OAuth token',
              'Content-Type': 'application/json'
            }
          });
        })
        .then(done, done);

    });

  });

  describe('#issueStatusChange', function () {

    it('should make a right request', function (done) {
      const issue = 'TASK-1';
      const status = 'open';

      startrek.issueStatusChange(issue, status)
        .then(() => {
          const url = 'http://example.com/issues/TASK-1/transitions/open/_execute';
          assert.calledWithMatch(got.patch, url, {
            body: null,
            headers: {
              Authorization: 'OAuth token',
              'Content-Type': 'application/json'
            }
          });
        })
        .then(done, done);

    });

  });

  describe('#parseIssue', function () {

    it('should extract issues from text', function () {
      const text = 'TASK-1, PROJECT-21 – foo bar';

      assert.deepEqual(startrek.parseIssue(text, ['TASK']), ['TASK-1']);

      assert.deepEqual(startrek.parseIssue(text, ['PROJECT']), ['PROJECT-21']);

      assert.deepEqual(startrek.parseIssue(text, ['TASK', 'PROJECT']), ['TASK-1', 'PROJECT-21']);
    });

  });

});
