export default function setup() {

  return function (req, res, next) {

    res.handleError = function (logger, err) {

      let resError = { message: err.message };
      let logError = err.name + ': ' + err.message;
      let resStatus = 500;
      let logMethod = 'error';

      switch (err.name) {

        case 'CastError':
          resStatus = 400;
          break;

        case 'MongoError':
          logError = err.name + ': ' + (err.errmsg || err.message);
          resError.message = err.errmsg || err.message;
          break;

        case 'NotFoundError':
          resStatus = 404;
          logMethod = 'info';
          break;

        case 'ValidationError': {
          resError = err;
          resStatus = 422;
          logMethod = 'info';
          break;
        }

        case 'UniqueConstraintError': {
          resStatus = 422;
          logMethod = 'info';
          break;
        }

        default:
          break;

      }

      logger[logMethod](logError);

      res.status(resStatus).json(resError);

    };

    next();

  };

}
