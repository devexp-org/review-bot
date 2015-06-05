var mongoose = require('mongoose');

module.exports.init = function (config) {
    mongoose.connect(config.host);

    mongoose
        .connection
        .on('error', console.error.bind(console, 'Connection error:'))
        .once('open', console.log.bind(console, 'Mongodb connected'));
};
