'use strict';

const gulp = require('gulp');
const pump = require('pump');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const maps = require('gulp-sourcemaps');
const autoprefix = require('gulp-autoprefixer');
const del = require('del');
const pug = require('gulp-pug');
const wbBuild = require('workbox-build');
const browserSync = require('browser-sync').create();

const reload = browserSync.reload;

// gulp.task('concatScripts', function() {
//   return gulp
//     .src(['node_modules/jquery/dist/jquery.js', 'js/main.js'])
//     .pipe(maps.init())
//     .pipe(concat('app.js'))
//     .pipe(maps.write('./'))
//     .pipe(gulp.dest('js'));
// });

// Deploy tasks
gulp.task('minifyScripts', function() {
  return gulp
    .src('src/js/index.js')
    .pipe(uglify())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('src/js'));
});

gulp.task('compileSass', function() {
  return gulp
    .src('src/stylesheets/main.scss')
    .pipe(maps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefix())
    .pipe(maps.write('./'))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.stream());
});

gulp.task('compressSass', function() {
  return gulp
    .src('src/stylesheets/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefix())
    .pipe(gulp.dest('src/css'));
});

gulp.task('pugCompressed', function() {
  return gulp.src('src/templates/*.pug').pipe(pug()).pipe(gulp.dest('src'));
});

gulp.task('clean', function() {
  return del(['dist', 'src/css/main.css*', 'src/js/app*.js*']);
});

gulp.task(
  'deploy',
  ['clean', 'compressSass', 'pugCompressed', 'minifyScripts'],
  function() {
    return gulp
      .src(
        [
          'src/css/main.css',
          'src/*.html',
          'src/js/index.js',
          'src/img/**',
          'src/fonts/**'
        ],
        {
          base: './src'
        }
      )
      .pipe(gulp.dest('dist'));
  }
);

// Watch tasks
gulp.task('watchJS', function(done) {
  reload();
  done();
});

gulp.task('watchPug', function() {
  gulp.watch('src/templates/*.pug', ['pug']);
});

gulp.task('serve', ['compileSass', 'pug'], function() {
  browserSync.init({
    server: {
      baseDir: './src'
    }
  });
  gulp.watch('stylesheets/**/*.scss', ['compileSass']);
  gulp.watch('js/index.js', ['watchJS']);
  gulp.watch('src/templates/*.pug', ['pug']);
  gulp.watch('*.html').on('change', reload);
});

gulp.task('pug', function() {
  return gulp
    .src('./src/templates/*.pug')
    .pipe(
      pug({
        pretty: true
      })
    )
    .pipe(gulp.dest('src'));
});

gulp.task('bundle-sw', () => {
  return wbBuild
    .generateSW({
      globDirectory: './dist/',
      swDest: './dist/sw.js',
      globPatterns: ['**/*.{html,js,css,wbp,jpg,png,svg}'],
      globIgnores: ['admin.html']
    })
    .then(() => {
      console.log('Service worker generated.');
    })
    .catch(err => {
      console.log('[ERROR] This happened: ' + err);
    });
});

gulp.task('default', ['deploy']);