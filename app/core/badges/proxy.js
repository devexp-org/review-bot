var proxy = require('proxy-express');
var config = require('app/core/config');

module.exports = proxy(config.load('badges').host, '/badges');
