import service from '../response';

describe('services/http/response', function () {

  let req, res, data, middlewere;

  beforeEach(function () {
    req = {};
    res = {
      json: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    };
    data = {};

    middlewere = service();
  });

  it('should extend `response` object', function (done) {

    middlewere(req, res, () => {
      assert.property(res, 'ok');
      assert.property(res, 'error');
      assert.property(res, 'success');
      done();
    });

  });

  describe('#ok', function () {

    it('should pass argument to `response.json` as is', function (done) {

      middlewere(req, res, () => {
        res.ok(data);

        assert.calledWithExactly(res.json, data);
        done();
      });

    });

  });

  describe('#error', function () {

    it('should send error message and status', function (done) {
      middlewere(req, res, () => {
        res.error();

        assert.calledWithExactly(res.status, 500);
        assert.calledWithExactly(res.json, { error: 'Internal error' });
        done();
      });
    });

    it('should able send a custom status', function (done) {
      middlewere(req, res, () => {
        res.error('Go away', 302);

        assert.calledWithExactly(res.status, 302);
        done();
      });

    });

    it('should able send a custom message', function (done) {
      middlewere(req, res, () => {
        res.error('Some error');

        assert.calledWithExactly(res.json, { error: 'Some error' });
        done();
      });

    });

  });

  describe('#success', function () {

    it('should pass argument to `response.json` wrapped in `{ data: ... }`', function (done) {
      middlewere(req, res, () => {
        res.success(data);

        assert.calledWithExactly(res.json, { data: data });
        done();
      });
    });

    it('should pass empty object if no argument was given', function (done) {
      middlewere(req, res, () => {
        res.success();

        assert.calledWithExactly(res.json, { data: {} });
        done();
      });

    });

  });

});
