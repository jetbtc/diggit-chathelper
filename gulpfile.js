var fs = require('fs'),
    pkg = require('./package.json'),
    gulp = require('gulp'),
    del = require('del'),
    through2 = require('through2'),
    replace = require('gulp-replace'),
    stylus = require('gulp-stylus'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint');

var paths = {
    script: 'src/chathelper.js',
    style: 'src/chathelper.styl',
    userscript: 'diggit-chathelper.user.js'
}

var jshintConfig = {
    sub: true,
    shadow: true,
    laxbreak: true,
    lookup: false
};

var styles = "";

gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del([paths.userscript], cb);
});

gulp.task('compile-stylus', function() {
    return gulp.src(paths.style)
        .pipe(stylus({
            compress: true
        }))
        .pipe(through2.obj(function(file, enc, done) {
            styles = String(file.contents);
            done();
        }));
});

gulp.task('build', ['compile-stylus'], function() {
    return gulp.src(paths.script)
        .pipe(replace('{{styles}}', styles))
        .pipe(replace('{{version}}', pkg.version))
        .pipe(jshint(jshintConfig))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(rename(paths.userscript))
        .pipe(gulp.dest('./'));
});
