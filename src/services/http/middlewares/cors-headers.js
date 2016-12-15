export default function setup() {

  const ORIGIN = '*';
  const METHOD = ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'];
  const HEADER = ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'];

  return function (req, res, next) {
    res.header('Access-Control-Allow-Origin', ORIGIN);
    res.header('Access-Control-Allow-Methods', METHOD.join(', '));
    res.header('Access-Control-Allow-Headers', HEADER.join(', '));

    next();
  };

}
