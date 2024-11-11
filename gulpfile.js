const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const plumber = require("gulp-plumber"); // エラーを確認
const notify = require("gulp-notify"); // エラーを通知する
const postcss = require("gulp-postcss"); // CSS
const mqpacker = require("css-mqpacker"); // メディアクエリ
const autoprefixer = require("autoprefixer"); // beforeprefix用
const sourcemaps = require("gulp-sourcemaps"); // ソースマップを作成する
const sassGlob = require("gulp-sass-glob"); // @importをまとめる
const rename = require("gulp-rename"); // ファイルをリネームする
const cleanCSS = require("gulp-clean-css"); // cssを圧縮する

const srcPath = {
  css: "./scss/*.scss",
};

const destPath = {
  css: "./css",
};

const cssSass = (done) => {
  return (
    src(srcPath.css)
      .pipe(
        plumber({
          errorHandler: notify.onError("Error:<%= error.message %>"),
        })
      )
      .pipe(sourcemaps.init())
      .pipe(sassGlob())
      .pipe(
        sass({
          outputStyle: "expanded",
        })
      )
      // .pipe(sourcemaps.write("./"))
      .pipe(
        postcss([
          autoprefixer({ overrideBrowserslist: ["last 2 versions"] }),
          mqpacker(),
        ])
      )
      .pipe(dest(destPath.css)) // 圧縮前のCSSファイルの出力
      .pipe(cleanCSS()) // CSSを圧縮
      .pipe(
        rename({
          extname: ".min.css", //.min.cssの拡張子にする
        })
      )
      .pipe(dest(destPath.css))
      .on("end", done)
  ); // タスクの終了を通知
};

const watchSassFiles = () => {
  watch("./scss/**/*.scss", cssSass);
};

exports.dev = watchSassFiles;
exports.default = series(cssSass);
