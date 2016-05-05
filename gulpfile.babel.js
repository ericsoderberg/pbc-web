"use strict";

import gulp from 'gulp';

gulp.task('copy', () => {
  gulp.src([
    'ui/index.html'
  ])
  .pipe(gulp.dest('dist'));
});
