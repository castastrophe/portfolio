import path from "node:path";
import * as sass from "sass";
import { minify } from "html-minifier";

import loadConfig from "postcss-load-config";
import postcss from "postcss";

import { InputPathToUrlTransformPlugin, RenderPlugin } from "@11ty/eleventy";
import pluginWebc from "@11ty/eleventy-plugin-webc";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import brokenLinks from "eleventy-plugin-broken-links";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginTOC from "eleventy-plugin-toc";

/** @param {import('@11ty/eleventy')} config */
export default async function(config) {
	// Layout aliases make templates more portable.
	config.addLayoutAlias("base", "layouts/base.webc");

	config.ignores.add("README.md");

	config.addPlugin(eleventyImageTransformPlugin, {
		urlPath: "/img/",
	});

	config.addPlugin(RenderPlugin);
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

	config.addTemplateFormats('scss');
	config.addExtension('scss', {
		outputFileExtension: 'css',
		useLayouts: false,
		bundle: "css",
		watch: true,
		compile: async function (content, inputPath) {
			const parsed = path.parse(inputPath);

			// Don't parse utilities or assets
			if (parsed.name.startsWith('_')) return;

			const compiled = await sass.compileStringAsync(content, {
				loadPaths: [
					parsed.dir || '.',
					path.join(this.config.dir.input, 'styles'),
				],
				sourceMap: process.env.ELEVENTY_ENV === 'production',
				sourceMapIncludeSources: true,
				style: process.env.ELEVENTY_ENV === 'production' ? 'compressed' : 'expanded',
			});

			// Add loaded URLs to the watch list
			this.addDependencies(inputPath, compiled.loadedUrls);

			return async () => {
				return compiled.css;
			};
		},
	});

	config.setLibrary('md', markdownIt().use(markdownItAnchor));

	config.addCollection("posts", function(collectionApi) {
		// Exclude the index file
		return collectionApi.getFilteredByGlob("pages/posts/*").filter(item => !item.inputPath.includes("index.webc"));
	});

	config.addCollection("proposals", function(collectionApi) {
		// Exclude the index file
		return collectionApi.getFilteredByGlob("pages/proposals/*").filter(item => !item.inputPath.includes("index.webc"));
	});

	config.addPlugin(InputPathToUrlTransformPlugin);
	config.addPlugin(syntaxHighlight);
	config.addPlugin(brokenLinks, {
		broken: "warn",
		forbidden: "warn",
		redirects: "warn",
		excludeInputs: [
			"styles/*",
		],
	});
	config.addPlugin(pluginTOC, {
		tags: ['h2', 'h3'],
		ul: false,
	});

	config.addFilter("isPost", function(page) {
		return page.inputPath.includes("posts/");
	});

	config.addFilter("toISOString", function(date) {
		return date?.toISOString();
	});

	config.addPassthroughCopy({
		"node_modules/prismjs/themes/prism.css": "styles/prism.css",
		"node_modules/prism-themes/themes/prism-one-light.css": "styles/prism-one-light.css",
		"node_modules/prism-themes/themes/prism-one-dark.css": "styles/prism-one-dark.css",
		"node_modules/prismjs/prism.js": "js/prism.js"
	});

	config.addBundle("css", {
		transforms: [
			async function(content) {
				const { page } = this;

				return postcss(styles.plugins).process(content, {
					...styles.options,
					from: page.inputPath,
					to: null,
				}).then(result => result.css);
			}
		]
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
		templateFormats: ["webc", "html", "md", "liquid", "scss"],
	};
};
