const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass')); // ここでコンパイラを指定
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");

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
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .pipe(postcss([autoprefixer({overrideBrowserslist: ['last 2 versions']})]))
    .pipe(dest(destPath.css))
    .on('end', done); // タスクの終了を通知
}

const watchSassFiles = () => {
  watch(srcPath.css, cssSass);
}

exports.watch = watchSassFiles;
exports.default = series(cssSass);
