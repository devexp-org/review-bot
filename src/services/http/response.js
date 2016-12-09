export default function setup() {

  return function (req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

    res.handleError = function (logger, err) {

      const plainError = Object.keys(err).length === 0;

      let resError = { message: err.message };
      let logError = plainError ? err.message : String(err);
      let resStatus = 500;
      let logMethod = 'error';

      switch (err.name) {

        case 'CastError':
          resStatus = 400;
          break;

        case 'MongoError':
          logError = err.name + ': ' + err.errmsg;
          resError.message = err.errmsg;
          break;

        case 'NotFoundError':
          resStatus = 404;
          logMethod = 'info';
          break;

        case 'ValidationError': {
          resError = err;
          resStatus = 422;
          logMethod = 'warn';
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
