/// <reference path="../typings/main.d.ts" />

var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-spawn-mocha');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var del = require('del');

/**
 * Testing
 */

function swallowError(err) {
  console.error(err);
  this.emit('end');
}

function runTests() {
  return gulp.src('./lib/**/*.spec.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({
      env: {'NODE_ENV': 'test'},
      istanbul: {
        x: ["'**spec**'"]
      }
    }));
}

// Run the tests once, piping errors to the console instead of breaking the
// build.
gulp.task('test-soft-fail', ['compile'], function() {
  return runTests().on('error', swallowError);
});

// Run the tests once
gulp.task('test', ['compile'], runTests);

/**
 * Compiling
 */

// Compile Typescript
gulp.task('compile', ['clean'], function() {
  gutil.log('Typing the script...');
  return tsProject.src('./src/**/*.ts*')
    .pipe(ts(tsProject)).js
    .pipe(gulp.dest('./lib'));
});


gulp.task('clean', function () {
  return del(['lib']);
});


/**
 * Watching
 */

gulp.task('watch', ['test-soft-fail'], function() {
  return gulp.watch(['src/**/*.*'], ['test-soft-fail']);
});

gulp.task('watch-debug', ['compile'], function() {
  return gulp.watch(['src/**/*.*'], ['compile']);
});