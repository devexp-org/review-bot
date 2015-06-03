var mongoose = require('mongoose'),
    config = require('app/config/server');

mongoose.connect(config.mongo.host);

mongoose
    .connection
    .on('error', console.error.bind(console, 'Connection error:'))
    .once('open', console.log.bind(console, 'Mongodb connected'));
