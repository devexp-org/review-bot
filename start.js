'use strict';

require('babel-register')({
  // Ignore everything in node_modules except node_modules/devexp-plugin.
  ignore: /node_modules\/(?!devexp-plugin-)/
});

require('./app');
