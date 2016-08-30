export default function setup() {

  return function (req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    res.handleError = function (logger, err) {

      let logError, resError;
      let resStatus = 500;
      let logMethod = 'error';

      const plainError = Object.keys(err).length === 0;

      logError = resError = err;

      if (plainError) {
        logError = err.message;
        resError = { name: err.name, message: err.message };
      } else {
        logError = String(err);
      }

      switch (err.name) {

        case 'ValidationError': {
          resStatus = 200;
          logMethod = 'warn';
          break;
        }

        case 'MongoError':
          logError = err.name + ': ' + err.errmsg;
          resError = err.toJSON();
          resError.name = 'MongoError';
          resError.message = err.errmsg;
          break;

        default:
          break;

      }

      logger[logMethod](logError);
      res.error(resError, resStatus);

    };

    next();

  };

}
