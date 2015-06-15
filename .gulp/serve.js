var nodemon = require('gulp-nodemon');

module.exports = function (gulp) {
    gulp.task('serve', function () {
        nodemon({
            script: 'app.js',
            ext: 'js',
            ignore: ['public/*', 'app/client/*', 'node_modules/*', '.gulp/*', '__tests__/*'],
            env: { 'NODE_ENV': 'development' },
            nodeArgs: ['--harmony']
        })
        .on('error', console.error.bind(console))
        .on('restart', function () {
            console.log('restarted!');
        });
    });
};
