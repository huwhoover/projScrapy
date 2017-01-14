'use strict'

var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    sass        = require('gulp-sass'),
    prefix      = require('gulp-autoprefixer'),
    cp          = require('child_process'),
    imagemin    = require('gulp-imagemin'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    pump        = require('pump'),
    jeet        = require('jeet'),
    gutil       = require('gulp-util');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from src/sass into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('src/sass/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

gulp.task('imagemin', function() {
    return gulp.src('src/img/*')
        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
        .pipe(gulp.dest('assets/images/'));
});

// js
gulp.task('compress', function (cb) {
  pump([
        gulp.src(['src/js/*.js', 'src/js/**/*.js']),
        uglify(),
        gulp.dest('assets/js/')
    ],
    cb
  );
});

gulp.task('scripts', function() {
  return gulp.src('src/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('assets/js/'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('src/sass/**', ['sass']);
    gulp.watch('src/js/**', ['compress','scripts']);
    gulp.watch('src/img/**', ['imagemin']);
    gulp.watch(['*.html', '**/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'compress', 'scripts', 'imagemin', 'watch'], function() {
  return gutil.log('Gulp is running!')
});
