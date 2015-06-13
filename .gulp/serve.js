var nodemon = require('gulp-nodemon');

module.exports = function (gulp) {
    gulp.task('serve', function () {
        nodemon({
            script: 'app.js',
            ext: 'ejs js',
            ignore: ['public/app.js', 'node_modules'],
            env: { 'NODE_ENV': 'development' },
            nodeArgs: ['--harmony']
        })
        .on('error', console.error.bind(console))
        .on('restart', function () {
            console.log('restarted!');
        });
    });
};
