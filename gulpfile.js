// Gulpfile for rannts statics
// Also, tuned for lektor-gulp

// Modules import
var args = require("minimist")(process.argv.slice(2)),
    autoprefixer = require("autoprefixer"),
    concat = require("gulp-concat"),
    cssnano = require("cssnano"),
    gulp = require("gulp"),
    htmlmin = require("gulp-html-minifier"),
    optipng = require("gulp-optipng"),
    path = require("path"),
    postcss = require("gulp-postcss"),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    uglifyjs = require("gulp-uglify");


// Constants
var DEFAULT_SOURCE = "frontend",
    DEFAULT_ASSETS = path.join("assets", "static");


// Directories used for tasks
var SOURCE = args.source || DEFAULT_SOURCE,
    SOURCE_JS_DIR = args.source_js_dir || "js",
    SOURCE_CSS_DIR = args.source_css_dir || "css",
    SOURCE_IMG_DIR = args.source_img_dir || "images",
    RESULT_DIR = args.result_dir || "",
    SOURCE_JS = path.join(SOURCE, SOURCE_JS_DIR),
    SOURCE_CSS = path.join(SOURCE, SOURCE_CSS_DIR),
    SOURCE_IMG = path.join(SOURCE, SOURCE_IMG_DIR),
    ASSETS_JS = args.assets_js || path.join(DEFAULT_ASSETS, SOURCE_JS_DIR),
    ASSETS_CSS = args.assets_css || path.join(DEFAULT_ASSETS, SOURCE_CSS_DIR),
    ASSETS_IMG = args.assets_img || path.join(DEFAULT_ASSETS, SOURCE_IMG_DIR);


gulp.task("default", ["build_static"]);
gulp.task("build_static", ["bundle_js", "bundle_css", "bundle_images"]);

// Tasks for lektor-gulp
gulp.task("server_spawn", ["watch"]);
gulp.task("before_build_all", ["build_static"]);
gulp.task("after_build_all", ["process_html"]);


gulp.task("watch", ["default"], function() {
    gulp.watch(SOURCE_JS, ["bundle_js"]);
    gulp.watch(SOURCE_CSS, ["bundle_css"]);
    gulp.watch(SOURCE_IMG, ["bundle_images"]);
});


gulp.task("bundle_js", function() {
    var options = {
        "mangle": true
    };

    return gulp.src(path.join(SOURCE_JS, "**.js"))
        .pipe(concat("main.js"))
        .pipe(uglifyjs(options))
        .pipe(gulp.dest(ASSETS_JS));
});


gulp.task("bundle_css", function() {
    var processors = [
        autoprefixer({browsers: ["last 3 version"]}),
        cssnano()
    ];

    return gulp.src(path.join(SOURCE_CSS, "main.sass"))
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss(processors))
        .pipe(rename("main.css"))
        .pipe(gulp.dest(ASSETS_CSS));
});


gulp.task("bundle_images", function() {
    var options = ["-o2"];

    return gulp.src(path.join(SOURCE_IMG, "**.png"))
        .pipe(optipng(options))
        .pipe(gulp.dest(ASSETS_IMG));
});


gulp.task("process_html", function() {
    var options = {
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: false,
        decodeEntities: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeEmptyElements: false, // required for burger menu
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true
    };

    return gulp.src(path.join(RESULT_DIR, "**/*.html"))
        .pipe(htmlmin(options))
        .pipe(gulp.dest(RESULT_DIR));
});
