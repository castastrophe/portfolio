import path from "node:path";
import { writeFile } from "node:fs/promises";
import postcss from "postcss";
import loadConfig from "postcss-load-config";
import { minify } from "html-minifier";

import pluginWebc from "@11ty/eleventy-plugin-webc";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import brokenLinks from "eleventy-plugin-broken-links";

/** @param {import('@11ty/eleventy')} config */
export default async function(config) {
	// Layout aliases make templates more portable.
	config.addLayoutAlias("base", "layouts/base.webc");

	config.ignores.add("README.md");

	config.addPlugin(pluginWebc, {
		// Glob to find no-import global components
		components: "./_includes/components/*.webc",

		// Adds an Eleventy WebC transform to process all HTML output
		useTransform: true,

		// Additional global data used in the Eleventy WebC transform
		transformData: {},

		// Options passed to @11ty/eleventy-plugin-bundle
		bundlePluginOptions: {},
	});

	const styles = await loadConfig({ env: process.env.ELEVENTY_ENV });
	const processCSS = async function (content, inputPath, outputPath) {
		const parsed = path.parse(inputPath);
		console.log(outputPath, parsed.name);

		return postcss(styles.plugins).process(content, {
			...styles.options,
			from: inputPath,
			to: outputPath
		}).then(async result => {
			// Write the map file to the output directory
			if (result.map) {
				await writeFile(path.join(path.dirname(outputPath), "css", parsed.name + ".css.map"), result.map.toString());
			}

			return result.css;
		});
	};

	config.addBundle("css", {
		toFileDirectory: "css",
		transforms: [
			async function(content) {
				return processCSS(content, this.inputPath, this.page?.outputPath);
			}
		]
	});

	config.addTemplateFormats('css');
	config.addExtension('css', {
		outputFileExtension: 'css',
		compile: async (inputContent, inputPath) => {
			return async ({ page }) => {
				return processCSS(inputContent, inputPath, page?.outputPath);
			};
		},
	});

	config.addCollection("posts", function(collectionApi) {
		return collectionApi.getFilteredByGlob("pages/posts/*.md");
	});

	config.addPassthroughCopy("img");

	config.addPlugin(InputPathToUrlTransformPlugin);
	config.addPlugin(syntaxHighlight);
	config.addPlugin(brokenLinks, {
		broken: "warn",
		forbidden: "warn",
		redirects: "warn",
	});

	config.addFilter("isPost", function(page) {
		return page.inputPath.includes("posts/");
	});

	config.addFilter("toISOString", function(date) {
		return date?.toISOString();
	});

	config.addPassthroughCopy({
		"node_modules/prismjs/themes/prism.css": "css/prism.css",
		"node_modules/prism-themes/themes/prism-one-light.css": "css/prism-one-light.css",
		"node_modules/prism-themes/themes/prism-one-dark.css": "css/prism-one-dark.css",
		"node_modules/prismjs/prism.js": "js/prism.js",
		"pages/home.css": "css/home.css",
		"pages/home.js": "js/home.js"
	});

	config.setServerOptions({
		// Open the browser automatically
		open: true,
		browser: "firefox",
		domDiff: false
	});

	// A debug utility.
	config.addFilter("dump", obj => {
	  return util.inspect(obj);
	});

	if (process.env.ELEVENTY_ENV === 'production') {
		config.addTransform('htmlmin', (content, outputPath) => {
		  if (!outputPath.endsWith('.html')) return content;

			return minify(content, {
				collapseInlineTagWhitespace: false,
				collapseWhitespace: true,
				removeComments: true,
				sortClassName: true,
				useShortDoctype: true,
			});
		});
	  }

	return {
		dir: {
			input: "pages",
			output: "public",
			includes: "../_includes",
			data: "../_data",
		},
		markdownTemplateEngine: false,
		htmlTemplateEngine: "webc",
	};
};
