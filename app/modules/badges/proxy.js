var proxy = require('proxy-express');
var config = require('app/modules/config');

module.exports = proxy(config.load('badges').host, '/badges');
