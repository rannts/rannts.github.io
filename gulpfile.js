// vim: set et sw=4 ts=4 foldmethod=marker:


// Imports ========================================================= {{{

const addsrc = require("gulp-add-src"),
    args = require("minimist")(process.argv.slice(2)),
    autoprefixer = require("autoprefixer"),
    concat = require("gulp-concat"),
    critical = require("critical").stream,
    cssnano = require("cssnano"),
    gulp = require("gulp"),
    htmlmin = require("gulp-html-minifier"),
    imagemin_gifsicle = require("imagemin-gifsicle"),
    imagemin_mozjpeg = require("imagemin-mozjpeg"),
    imagemin = require("gulp-imagemin"),
    imagemin_zopfli = require("imagemin-zopfli"),
    path = require("path"),
    postcss_fixes = require("postcss-fixes"),
    postcss = require("gulp-postcss"),
    purify = require("gulp-purifycss"),
    sass = require("gulp-sass"),
    typograph = require("gulp-typograf"),
    zopfli = require("gulp-zopfli"),
    uglifyjs = require("gulp-uglify");

// }}}
// Constants ======================================================= {{{

const DEFAULT_SOURCE = "frontend",
    DEFAULT_ASSETS = path.join("assets", "static");

const SOURCE = args.source || DEFAULT_SOURCE,
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

// }}}
// Initialization ================================================== {{{

require("events").EventEmitter.prototype._maxListeners = 100;

// }}}

// Main tasks ====================================================== {{{

gulp.task("default",
    ["build_static", "watch"]);
gulp.task("server_spawn",
    ["default"]);
gulp.task("build_static",
    ["bundle:js", "bundle:css", "bundle:images"]);


gulp.task("bundle:js", function() {
    return gulp.src(path.join(SOURCE_JS, "**.js"))
        .pipe(concat("main.js"))
        .pipe(gulp.dest(ASSETS_JS));
});


gulp.task("bundle:css", function() {
    return gulp.src(path.join(SOURCE_CSS, "main.sass"))
        .pipe(sass().on("error", sass.logError))
        .pipe(addsrc.append(
            path.join("node_modules", "typograf", "dist", "typograf.css")))
        .pipe(concat("main.css"))
        .pipe(gulp.dest(ASSETS_CSS));
});


gulp.task("bundle:images", function() {
    return gulp.src(path.join(SOURCE_IMG, "**"))
        .pipe(gulp.dest(ASSETS_IMG));
});


gulp.task("watch", function() {
    gulp.watch(path.join(SOURCE_JS, "**.js"), ["bundle_js"]);
    gulp.watch(path.join(SOURCE_CSS, "**.sass"), ["bundle_css"]);
    gulp.watch(SOURCE_IMG, ["bundle_images"]);
});

// }}}
// Before 'build_all' ============================================== {{{

gulp.task("before_build_all",
    ["build_static"]);

// }}}
// After 'build_all' =============================================== {{{

gulp.task("after_build_all",
    ["optimize_static"]);
gulp.task("optimize_static",
    ["optimize:js", "optimize:css", "optimize:images", "optimize:html"]);


gulp.task("optimize:js", ["optimize:js:uglify"], function() {
    return gulp.src(path.join(RESULT_DIR, "**", "*.js"))
        .pipe(zopfli())
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:css", ["optimize:css:postcss", "optimize:css:purify", "optimize:css:critical"], function () {
    return gulp.src(path.join(RESULT_DIR, "**", "*.css"))
        .pipe(zopfli())
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:html", ["optimize:html:minify", "optimize:css:critical"], function () {
    return gulp.src(path.join(RESULT_DIR, "**", "*.html"))
        .pipe(zopfli())
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:images", function() {
    var gifPlugin = imagemin_gifsicle({"optimizationLevel": 3}),
        pngPlugin = imagemin_zopfli({"more": true}),
        jpegPlugin = imagemin_mozjpeg(),
        srcPaths = [
            path.join(RESULT_DIR, "**", "*.jpg"),
            path.join(RESULT_DIR, "**", "*.jpeg"),
            path.join(RESULT_DIR, "**", "*.png"),
            path.join(RESULT_DIR, "**", "*.gif")
        ];

    return gulp.src(srcPaths)
        // .pipe(imagemin([gifPlugin, pngPlugin, jpegPlugin]))
        .pipe(imagemin([gifPlugin, pngPlugin]))
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:js:uglify", function () {
    var options = {"mangle": true};

    return gulp.src(path.join(RESULT_DIR, "**.js"))
        .pipe(uglifyjs(options))
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:css:postcss", function() {
    var processors = [
        postcss_fixes(),
        autoprefixer({browsers: ["last 3 version"]})
    ];

    return gulp.src(path.join(RESULT_DIR, "**.css"))
        .pipe(postcss(processors))
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:css:purify", ["optimize:css:postcss"], function () {
    var context = [
        path.join(RESULT_DIR, "**", "*.js"),
        path.join(RESULT_DIR, "**", "*.html")
    ];

    return gulp.src(path.join(RESULT_DIR, "**/main.css"))
        .pipe(purify(context))
        .pipe(postcss([cssnano()]))
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:css:critical", ["optimize:css:purify", "optimize:html:minify"], function () {
    var path_htmls = path.join(RESULT_DIR, "**", "*.html"),
        critical_stream = critical({
            base: RESULT_DIR,
            inline: true,
            minify: true,
            css: [path.join(RESULT_DIR, "static", "css", "main.css")]
        });

    return gulp.src(path_htmls)
        .pipe(critical_stream)
        .on("error", function(err) { console.log(err.message); })
        .pipe(gulp.dest(RESULT_DIR));
});


gulp.task("optimize:html:minify", function () {
    var typo_options = {
            "locale": ["ru", "en_US"],
            "enableRule": [
                "common/space/delLeadingBlanks",
                "ru/money/ruble",
                "ru/optalign/*"
            ]
        },
        options = {
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
        .pipe(typograph(typo_options))
        .pipe(htmlmin(options))
        .pipe(gulp.dest(RESULT_DIR));
});

// }}}
