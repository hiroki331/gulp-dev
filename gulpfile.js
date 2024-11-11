const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass')); // ここでDart Sassを指定
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sourcemaps = require('gulp-sourcemaps'); // sourcemapsの読み込み
const sassGlob = require("gulp-sass-glob");

const srcPath = {
  css: './scss/*.scss',
}

const destPath = {
  css: './css',
}

const cssSass = (done) => {
  return src(srcPath.css) 
    .pipe(plumber({
      errorHandler: notify.onError('Error:<%= error.message %>')
    }))
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass({
      outputStyle: "expanded"
    }))
    // .pipe(sourcemaps.write("./"))
    .pipe(postcss([autoprefixer({overrideBrowserslist: ['last 2 versions']})]))
    .pipe(dest(destPath.css))
    .on('end', done); // タスクの終了を通知
}

const watchSassFiles = () => {
  watch(srcPath.css, cssSass);
}

exports.dev = watchSassFiles;
exports.default = series(cssSass);
