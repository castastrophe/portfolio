const compress = require("compression");


const nunjucks = require("nunjucks");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItContainer = require("markdown-it-container");

const pluginSass = require("eleventy-plugin-sass");
const pluginBabel = require('eleventy-plugin-babel');
const addWebComponentDefinitions = require('eleventy-plugin-add-web-component-definitions')

module.exports = function (eleventyConfig) {
  let nunjucksEnvironment = new nunjucks.Environment(
    new nunjucks.FileSystemLoader("_includes")
  );

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
        babel: { presets: ['@babel/env'] }
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
    });

    // eleventyConfig.addPassthroughCopy({
    //     "./demo": "examples"
    // });

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

    let options = {
        html: true
    };

    const parseTokens = (tokens, idx) => {
        let id = "", attrs = [], classes = [];
      let m = tokens[idx].info.trim().match(/^band+(.*)$/);
      let config = m && m[1].trim().split(" ");
      if (config && config.length > 0) {
          config.forEach(item => {
              // Look for IDs
              let find = item.match(/^#([\w|-]+)/);
              if (find && find.length > 0) id = find[1];
              // Look for classes
              find = item.match(/^\.([\S]+)/);
              if (find && find.length > 0) classes.push(find[1]);
              // Look for attributes
              find = item.match(/^\|([\S]+)/);
              if (find && find.length > 0) attrs.push(find[1]);
          });
      }
      return { id, attrs, classes };
    };

    let markdownLib = markdownIt(options);
    markdownLib.use(markdownItAnchor);
    markdownLib.use(markdownItContainer, "band", {
      validate: params => {
        return params.trim().match(/^band+(.*)$/);
      },
      render: (tokens, idx) => {
        let { id, attrs, classes } = parseTokens(tokens, idx);
        if (tokens[idx].nesting === 1) {
          return `<pfe-band${id ? ` id="${id}"` : ""}${classes.length > 0 ? ` class="${classes.join(" ")}"` : ""}${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>`
        } else {
          return `</pfe-band>\n`;
        }
      }
    });

    markdownLib.use(markdownItContainer, "section", {
      validate: params => {
        return params.trim().match(/^section+(.*)$/);
      },
      render: (tokens, idx) => {
        let { id, attrs, classes } = parseTokens(tokens, idx);
        if (tokens[idx].nesting === 1) {
          return `<section${id ? ` id="${id}"` : ""}${classes.length > 0 ? ` class="${classes.join(" ")}"` : ""}${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>`
        } else {
          return `</section>\n`;
        }
      },
      marker: ";"
    });

    // markdownLib.use(markdownItContainer, "pfe-*", {
    //   validate: params => {
    //     return params.trim().match(/^pfe-(.*)$/);
    //   },
    //   render: (tokens, idx) => {
    //       console.log(tokens);
          
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

    eleventyConfig.setLibrary("md", markdownLib);
    eleventyConfig.setLibrary("html", nunjucksEnvironment);

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