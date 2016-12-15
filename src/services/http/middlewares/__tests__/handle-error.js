import service from '../handle-error';
import loggerMock from '../../../logger/__mocks__/';

import MongooseError from 'mongoose/lib/error';
import { MongoError } from 'mongodb';
import {
  NotFoundError,
  UniqueConstraintError
} from '../../../../modules/errors/';

describe('services/http/middleweres/handle-error', function () {

  let req, res, err, logger, middlewere;

  beforeEach(function () {
    req = {};
    res = {
      json: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    };

    logger = loggerMock();

    middlewere = service();
  });

  it('should extend `response` object', function (done) {

    middlewere(req, res, () => {
      assert.property(res, 'handleError');
      done();
    });

  });

  describe('#handleError', function () {

    it('should handle `CastError` error', function () {

      err = new MongooseError.CastError(Object, 'val', 'path');
      const message = 'Cast to function Object() ' +
        '{ [native code] } failed for value "val" at path "path"';

      middlewere(req, res, () => {
        res.handleError(logger, err);

        assert.calledWithExactly(res.json, { message: message });

        assert.calledWithExactly(res.status, 400);

        assert.calledWithExactly(logger.error, 'CastError: ' + message);
      });

    });

    it('should handle `MongoError` error', function () {

      err = new MongoError('some error');

      middlewere(req, res, () => {
        res.handleError(logger, err);

        assert.calledWithExactly(res.json, { message: 'some error' });

        assert.calledWithExactly(res.status, 500);

        assert.calledWithExactly(logger.error, 'MongoError: some error');
      });

    });

    it('should handle `NotFoundError` error', function () {

      err = new NotFoundError('something is not found');

      middlewere(req, res, () => {
        res.handleError(logger, err);

        assert.calledWithExactly(res.json, { message: 'something is not found' });

        assert.calledWithExactly(res.status, 404);

        assert.calledWithExactly(logger.info, 'NotFoundError: something is not found');
      });

    });

    it('should handle `ValidationError` error', function () {

      err = new MongooseError.ValidationError();

      middlewere(req, res, () => {
        res.handleError(logger, err);

        assert.calledWithExactly(res.json, err);

        assert.calledWithExactly(res.status, 422);

        assert.calledWithExactly(logger.info, 'ValidationError: Validation failed');
      });

    });

    it('should handle `UniqueConstraintError` error', function () {

      err = new UniqueConstraintError('some error');

      middlewere(req, res, () => {
        res.handleError(logger, err);

        assert.calledWithExactly(res.json, { message: 'some error' });

        assert.calledWithExactly(res.status, 422);

        assert.calledWithExactly(logger.info, 'UniqueConstraintError: some error');
      });

    });

    it('should handle any error', function () {

      err = new Error('some error');

      middlewere(req, res, () => {
        res.handleError(logger, err);

        assert.calledWithExactly(res.json, { message: 'some error' });

        assert.calledWithExactly(res.status, 500);

        assert.calledWithExactly(logger.error, 'Error: some error');
      });

    });
  });

});
