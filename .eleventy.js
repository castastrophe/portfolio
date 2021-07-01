const nunjucks = require("nunjucks");
const moment = require("moment");

const compress = require("compression");
const pluginSass = require("eleventy-plugin-sass");
const pluginBabel = require('eleventy-plugin-babel');
const addWebComponentDefinitions = require('eleventy-plugin-add-web-component-definitions')

module.exports = function (eleventyConfig) {
  // eleventyConfig.setQuietMode(process.env.npm_config_quiet);
  eleventyConfig.setQuietMode(false);
  eleventyConfig.setWatchThrottleWaitTime(500);

  eleventyConfig.addPlugin(pluginSass, {
    watch: ['./sass/*.scss', '!node_modules/**'],
    outputDir: './public/css',
    outputStyle: 'compressed',
    uglify: true,
    sourcemaps: true,
    autoprefixer: true
  });

  eleventyConfig.addPlugin(pluginBabel, {
    watch: ['./js/*.js', '!node_modules/**'],
    outputDir: './public/js/',
    uglify: true,
    sourcemaps: true,
    babel: {
      presets: ['@babel/env']
    }
  });

  eleventyConfig.addPlugin(addWebComponentDefinitions, {
    path: (tag) => {
      if ([
          "pfe-tab",
          "pfe-tab-panel",
          "pfe-accordion-header",
          "pfe-accordion-panel"
        ].includes(tag)) return;
      return `/js/${tag}/dist/${tag}.min.js`;
    }
  });

  eleventyConfig.addCollection("posts");

  eleventyConfig.addPassthroughCopy("./img");

  eleventyConfig.addPassthroughCopy({
    "./node_modules/magnific-popup/website/third-party-libs/jquery.min.js": "js/vendor/",
    "./node_modules/magnific-popup/dist/jquery.magnific-popup.min.js": "js/vendor/",
  });

  eleventyConfig.addPassthroughCopy({
    "./node_modules/@patternfly/pfe-accordion/dist/*.min.js*": "js/pfe-accordion/dist/",
    "./node_modules/@patternfly/pfe-accordion/dist/*.min.css*": "css/pfe-accordion/dist/",
    "./node_modules/@patternfly/pfe-band/dist/*.min.js*": "js/pfe-band/dist/",
    "./node_modules/@patternfly/pfe-band/dist/*.min.css*": "css/pfe-band/dist/",
    "./node_modules/@patternfly/pfe-card/dist/*.min.js*": "js/pfe-card/dist/",
    "./node_modules/@patternfly/pfe-card/dist/*.min.css*": "css/pfe-card/dist/",
    "./node_modules/@patternfly/pfe-codeblock/dist/*.min.js*": "js/pfe-codeblock/dist/",
    "./node_modules/@patternfly/pfe-codeblock/dist/*.min.css*": "css/pfe-codeblock/dist/",
    "./node_modules/@patternfly/pfe-content-set/dist/*.min.js*": "js/pfe-content-set/dist/",
    "./node_modules/@patternfly/pfe-content-set/dist/*.min.css*": "css/pfe-content-set/dist/",
    "./node_modules/@patternfly/pfe-cta/dist/*.min.js*": "js/pfe-cta/dist/",
    "./node_modules/@patternfly/pfe-cta/dist/*.min.css*": "css/pfe-cta/dist/",
    "./node_modules/@patternfly/pfe-icon/dist/*.min.js*": "js/pfe-icon/dist/",
    "./node_modules/@patternfly/pfe-icon/dist/*.min.css*": "css/pfe-icon/dist/",
    "./node_modules/@patternfly/pfe-tabs/dist/*.min.js*": "js/pfe-tabs/dist/",
    "./node_modules/@patternfly/pfe-tabs/dist/*.min.css*": "css/pfe-tabs/dist/",
    "./node_modules/@patternfly/pfelement/dist/*.min.js*": "js/pfelement/dist/",
    "./node_modules/@patternfly/pfelement/dist/*.min.css*": "css/pfelement/dist/",
    "./node_modules/@patternfly/pfe-styles/dist/*.min.css*": "css/pfe-styles/dist/",
  });

  eleventyConfig.addLayoutAlias('post', 'post.njk');
  eleventyConfig.addLayoutAlias('general', 'general.njk');
  eleventyConfig.addLayoutAlias('base', 'base.njk');

  let nunjucksEnvironment = new nunjucks.Environment(
    new nunjucks.FileSystemLoader("_includes")
  );

  eleventyConfig.setLibrary("md", nunjucksEnvironment);
  eleventyConfig.setLibrary("njk", nunjucksEnvironment);

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

  eleventyConfig.addFilter("date", (UTC) => moment(UTC).format("YYYY MMM D"));
  eleventyConfig.addFilter("id", (string) => string.replace(" ", ""));

  return {
    dir: {
      input: "./pages",
      output: "./public",
      includes: "_includes",
      layouts: "_layouts"
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