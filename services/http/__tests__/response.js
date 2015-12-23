import service from '../../http/response';

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

  it('should expand `response` object', function (done) {

    middlewere(req, res, () => {

      assert.property(res, 'ok');
      assert.property(res, 'error');
      assert.property(res, 'success');

      done();

    });

  });

  describe('#ok', function () {

    it('should pass argument to `response.json` as is', function () {

      middlewere(req, res, () => {
        res.ok(data);

        assert.calledWithExactly(res.json, data);
      });

    });

  });

  describe('#success', function () {

    it('should pass argument to `response.json` wrapped as `{ data: ... }`', function () {

      middlewere(req, res, () => {
        res.success(data);

        assert.calledWithExactly(res.json, { data: data });
      });

    });

    it('should pass empty object if no argument', function () {

      middlewere(req, res, () => {
        res.success();

        assert.calledWithExactly(res.json, { data: {} });
      });

    });

  });

  describe('#error', function () {

    it('should send default error message and status', function (done) {

      middlewere(req, res, () => {
        res.error();
        done();
      });

    });

    it('should send custom status', function () {
      middlewere(req, res, () => {
        res.error('Go away', 302);

        assert.calledWithExactly(res.status, 302);
      });

    });

    it('should pass argument to `response.json` wrapped as `{ error: ... }`', function () {
      middlewere(req, res, () => {
        res.error('Some error');

        assert.calledWithExactly(res.json, { error: 'Some error' });
      });

    });

  });

});
