const path = require("node:path");

// Compilers for styles
const sass = require("sass");
const autoprefixer = require("autoprefixer");
const postcss = require("postcss");

// Compilers for scripts
const esmify = require("esmify");
const babelify = require("babelify");
const babelPreset = require("@babel/preset-env");
const browserify = require("browserify");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginBundler = require("@11ty/eleventy-plugin-bundle");

const pluginDrafts = require("./plugins/drafts.js");
const pluginImages = require("./plugins/images.js");
const pluginFilters = require("./plugins/filters.js");
const pluginTemplates = require("./plugins/templates.js");

const {
  EleventyRenderPlugin,
  EleventyHtmlBasePlugin,
} = require("@11ty/eleventy");

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = (eleventyConfig) => {
  const isDev =
    ["watch", "serve"].includes(process.env.ELEVENTY_RUN_MODE) &&
    process.env.NODE_ENV !== "production";
  const useSourceMap = isDev;

  if (isDev) eleventyConfig.setQuietMode(true);

  eleventyConfig.addPassthroughCopy({
    "./node_modules/@shoelace-style/shoelace/dist/assets": "/assets",
    "./node_modules/@shoelace-style/shoelace/dist/shoelace.js": "/shoelace.js",
    "./node_modules/@shoelace-style/shoelace/dist/chunks/": "/chunks",
  });

  eleventyConfig.addWatchTarget("./pages/**/*.");

  // App plugins
  eleventyConfig.addPlugin(pluginDrafts);
  eleventyConfig.addPlugin(pluginImages);
  eleventyConfig.addPlugin(pluginFilters);
  eleventyConfig.addPlugin(pluginTemplates);

  // Official plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(pluginBundler, {
    transforms: [
      async function (content) {
        if (this.page.inputPath.endsWith(".js")) {
          let result = browserify({
            transform: [
              [
                babelify,
                {
                  presets: [babelPreset],
                  sourceMaps: useSourceMap,
                  compact: !!isDev,
                  minified: !!isDev,
                },
              ],
            ],
            plugin: [esmify],
          })
            .add(this.page.inputPath)
            .bundle();
          return result.toString();
        }
        return content;
      },
    ],
  });

  // Creates the extension for use
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compileOptions: {
      cache: false,
    },
    isIncrementalMatch: function (modifiedFile) {
      if (!this.isFullTemplate || modifiedFile.startsWith("_")) {
        return true;
      }
      if (this.inputPath === modifiedFile) {
        return true;
      }
      return false;
    },
    // `compile` is called once per .scss file in the input directory
    compile: async function (inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) return;

      const result = sass.compileString(inputContent, {
        style: isDev ? "expanded" : "compressed",
        loadPaths: [parsed.dir || ".", this.config.dir.includes],
        sourceMap: useSourceMap,
      });

      const dependencies = result.loadedUrls
        ?.filter((dep) => dep.protocol === "file:")
        .map((entry) => {
          return path.relative(".", entry.pathname);
        });
      this.addDependencies(inputPath, dependencies);

      let prefixed = result.css.toString("utf8");
      if (!isDev) {
        prefixed = postcss([autoprefixer])
          .process(prefixed, {
            from: inputPath,
            map: useSourceMap,
          })
          .then((result) => {
            result.warnings().forEach((warn) => {
              console.warn(warn.toString());
            });
            return result.css;
          });
      }

      this.addDependencies(inputPath, result.loadedUrls);

      // This is the render function, `data` is the full data cascade
      return async () => prefixed;
    },
  });

  eleventyConfig.ignores.add("pages/demo/**");
  eleventyConfig.setBrowserSyncConfig({
    open: true,
  });

  return {
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
    dir: {
      input: "pages",
      includes: "../_includes",
      data: "../_data",
      output: "public",
    },
    pathPrefix: "/",
  };
};
