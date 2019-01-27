"use strict"; //enable strict mode

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var del = require("del");
var rename = require("gulp-rename");
var svg = require("gulp-svgstore");
var minifycss = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require('gulp-webp');
var include = require('posthtml-include');
var posthtml = require('gulp-posthtml');

// clean build folder
gulp.task("clean", function() {
  return del("build");
});

// make svg sprite
gulp.task("makesprite", function() {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svg({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

// minify styles
gulp.task("styleminify", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(minifycss())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"));
});

// copy fonts, pictures, scripts to build folder
gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

// optimize images
gulp.task("optimizeimages", function () {
  return gulp.src("build/img/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));

});

// make webp images
gulp.task("makewebp", function () {
  return gulp.src("build/img/*.{jpg,png}")
    .pipe(webp({
      quality: 90,
      method: 6
    }))
    .pipe(gulp.dest("build/img"));
});

// make html with include plugin
gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

// start local server
gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("styleminify")).on("change", server.reload);
  gulp.watch("source/*.html", gulp.series("html")).on("change", server.reload);
});

// combie tasks for build
gulp.task("build",
  gulp.series(
    "clean",
    "makesprite",
    "styleminify",
    "copy",
    "html",
    "optimizeimages",
    "makewebp"
  )
);
