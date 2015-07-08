var configBuilder = require('./webpack-config.js'),
    options = {
        entryPoint: 'app/client/index.jsx',
        autoprefixer: ['last 2 versions'],
        debug: !!process.env.WEBPACK_DEV,
        devServer: {
            port: process.env.WEBPACK_DEV_PORT || 8080,
            publicPath: 'public'
        },
        paths: {
            dest: 'public'
        }
    };

module.exports = configBuilder(options);
