var webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    config = require('./webpack-config.js');

module.exports = function (gulp, paths, webpackDevServerOpts, autoprefixer) {
    gulp.task('webpack:dev', function (cb) {
        var compiler = webpack(config({
            entryPoint: paths.clientEntryPoint,
            debug: true,
            devServer: webpackDevServerOpts,
            paths,
            autoprefixer
        }));

        new WebpackDevServer(compiler, {
            publicPath: 'http://localhost:8080/public',
            hot: true
        }).listen(8080, 'localhost', function (err) {
            if (err) console.error(err);
            console.log('[webpack-dev-server]', 'started http://localhost:8080');
            cb();
        });
    });

    gulp.task('webpack:prod', function (cb) {
        webpack(
            config({
                entryPoint: paths.clientEntryPoint,
                paths: paths,
                debug: false
            }),
            function (err, stats) {
                if (err) console.error(err);
                console.log('[webpack]', stats.toString());
                cb();
            }
        );
    });
};
