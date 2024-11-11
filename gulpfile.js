const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const postcss = require("gulp-postcss");
const mqpacker = require('css-mqpacker');  
const autoprefixer = require("autoprefixer");
const sourcemaps = require('gulp-sourcemaps');
const sassGlob = require("gulp-sass-glob");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");

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
    .pipe(postcss([autoprefixer({overrideBrowserslist: ['last 2 versions']}), mqpacker()]))
    .pipe(dest(destPath.css)) // 圧縮前のCSSファイルの出力
    .pipe(cleanCSS()) // CSSを圧縮
    .pipe(
      rename({
        extname: '.min.css' //.min.cssの拡張子にする
      })
    )
    .pipe(dest(destPath.css))
    .on('end', done); // タスクの終了を通知
}

const watchSassFiles = () => {
  watch('./scss/**/*.scss', cssSass);
}

exports.dev = watchSassFiles;
exports.default = series(cssSass);
