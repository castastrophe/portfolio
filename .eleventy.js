const compress = require("compression");
// const markdownIt = require("markdown-it");
// const markdownItAnchor = require("markdown-it-anchor");
// const markdownItContainer = require("markdown-it-container");
const pluginSass = require("eleventy-plugin-sass");
const pluginBabel = require('eleventy-plugin-babel');
const addWebComponentDefinitions = require('eleventy-plugin-add-web-component-definitions')

module.exports = function (eleventyConfig) {
    // eleventyConfig.setQuietMode(process.env.npm_config_quiet);
    eleventyConfig.setWatchThrottleWaitTime(500);

    eleventyConfig.addPlugin(pluginSass, {
        watch: ['./sass/*.scss', '!node_modules/**'],
        outputDir: './_site/css',
        outputStyle: 'compressed',
        uglify: true,
        sourcemaps: true,
        autoprefixer: true
    });

    eleventyConfig.addPlugin(pluginBabel, {
        watch: ['./js/*.js', '!node_modules/**'],
        outputDir: './_site/js/',
        uglify: true,
        sourcemaps: true,
        babel: { presets: ['@babel/env'] }
    });

    eleventyConfig.addPlugin(addWebComponentDefinitions, {
        path: (tag) => `js/${tag}/dist/${tag}.min.js`,
        verbose: true
    });

    eleventyConfig.addPassthroughCopy("./img");

    eleventyConfig.addPassthroughCopy({
        "./node_modules/@patternfly/pfe-accordion/dist/*.min.js*": "js/pfe-accordion/dist/",
        "./node_modules/@patternfly/pfe-band/dist/*.min.js*": "js/pfe-band/dist/",
        "./node_modules/@patternfly/pfe-card/dist/*.min.js*": "js/pfe-card/dist/",
        "./node_modules/@patternfly/pfe-content-set/dist/*.min.js*": "js/pfe-content-set/dist/",
        "./node_modules/@patternfly/pfe-cta/dist/*.min.js*": "js/pfe-cta/dist/",
        "./node_modules/@patternfly/pfe-icon/dist/*.min.js*": "js/pfe-icon/dist/",
        "./node_modules/@patternfly/pfe-tabs/dist/*.min.js*": "js/pfe-tabs/dist/",
        "./node_modules/@patternfly/pfelement/dist/*.min.js*": "js/pfelement/dist/"
    });

    eleventyConfig.addPassthroughCopy({
        "./_temp/css": "css",
        "./_temp/js": "js"
    });

    eleventyConfig.addPassthroughCopy({
        "./demo": "examples",
        "./pages": "/"
    });

    // './node_modules/magnific-popup/website/third-party-libs/jquery.min.js': "js/",
    // './node_modules/magnific-popup/dist/jquery.magnific-popup.min.js': "js/"

    eleventyConfig.addFilter('dump', obj => {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            };
        };

        return JSON.stringify(obj, getCircularReplacer(), 4);
    });

    // let options = {
    //     html: true
    // };

    // let markdownLib = markdownIt(options);
    // markdownLib.use(markdownItAnchor);
    // markdownLib.use(markdownItContainer, "section", {
    //   validate: params => {
    //     return params.trim().match(/^section+(.*)$/);
    //   },
    //   render: (tokens, idx) => {
    //     let m = tokens[idx].info.trim().match(/^section+(.*)$/);
    //     let color = m && m[1].trim() === "header" ? "" : "lightest";
    //     let size = m && m[1].trim() === "header" ? "" : "small";
    //     let classes = m && m[1].trim() === "header" ? `class="header"` : "";

    //     if (tokens[idx].nesting === 1) {
    //       return `<pfe-band ${size ? `size="${size}"` : ""} color="${color}"${classes} use-grid>`
    //     } else {
    //       return `</pfe-band>\n`;
    //     }
    //   }
    // });

    // eleventyConfig.setLibrary("md", markdownLib);

    return {
        dir: {
            input: "./docs",
            output: "./public"
        },
        setBrowserSyncConfig: {
            open: true,
            server: {
                baseDir: "./public",
                middleware: [compress()]
            }
        },
        templateFormats: [
            "html",
            "md",
            "css",
            "js",
            "svg",
            "png"
        ]
    }
};