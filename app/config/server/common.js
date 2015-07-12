var path = require('path');

module.exports = {
    staticBase: '/public',
    staticPath: path.join(__dirname, '..', '..', '..', 'public'),
    port: process.env.PORT || 3000
};
