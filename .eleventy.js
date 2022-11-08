const fs = require("fs");
const util = require('util');

const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginNavigation = require("@11ty/eleventy-navigation");
const htmlmin = require("html-minifier");
const embedYouTube = require("eleventy-plugin-youtube-embed");

const PostCSSPlugin = require("eleventy-plugin-postcss");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy({
    "./node_modules/@shoelace-style/shoelace/dist/themes/*.css": "css",
    "./node_modules/@shoelace-style/shoelace/dist/shoelace.js": "js/shoelace/shoelace.js",
    "./node_modules/@shoelace-style/shoelace/dist/components": "js/shoelace/components",
    "./node_modules/@shoelace-style/shoelace/dist/chunks/*.js": "js/shoelace/chunks",
    "./node_modules/@shoelace-style/shoelace/dist/assets": "js/shoelace/assets"
  });
  
  eleventyConfig.addWatchTarget("./content/css/**/*.scss");

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(embedYouTube, {
    // allowAttrs: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
    // allowAutoplay: true,
    allowFullScreen: true,
    lazy: true,
    modestBranding: true,
    recommendSelfOnly: true,
  });
  
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if( outputPath && outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    if (dateObj instanceof Date) {
      return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
    } else if (dateObj instanceof String) {
      return DateTime.fromISO(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
    }
    return;
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    if (dateObj instanceof Date) {
      return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    } else if (typeof dateObj === 'string') {
      return DateTime.fromISO(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    }
    return;
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if(!Array.isArray(array) || array.length === 0) return [];
    if( n < 0 ) return array.slice(n);
    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  eleventyConfig.addFilter('console', (value) => `<div style="white-space: pre-wrap;">${util.inspect(value)}</div>;`);

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link",
      symbol: "#"
    }),
    level: [1,2,3,4],
    slugify: eleventyConfig.getFilter("slugify")
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
    ],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don't worry about leading and trailing slashes, we normalize these.

    // If you don't have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    // pathPrefix: "/",
    // -----------------------------------------------------------------

    // These are all optional (defaults are shown):
    dir: {
      input: "content",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};