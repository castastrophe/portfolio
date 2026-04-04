import path from "node:path";

import loadConfig from "postcss-load-config";
import { minify } from "html-minifier";
import dotenv from "dotenv";
import prettier from 'prettier';

import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyNavigation from "@11ty/eleventy-navigation";

import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginTOC from "eleventy-plugin-toc";

import customFilters from "./utilities/filters/index.js";
import { processCSS } from "./utilities/transforms/index.js";

/** @param {import('@11ty/eleventy').TemplateConfig} config */
export default async function (config) {
	dotenv.config({ path: ".env" });

	const NODE_MODULES_PATH = 'node_modules';
	const isProduction = process.env.ELEVENTY_ENV === 'production';
	const CONTENT_DIRS = ['posts', 'proposals'];

	config.setDataFileBaseName("index");
	config.ignores.add("README.md");
	config.ignores.add("**/CLAUDE.md");

	config.setInputDirectory("pages");
	config.setOutputDirectory("public");
	// these are relative to input directory...
	config.setIncludesDirectory("../_includes");
	config.setLayoutsDirectory("../_includes/layouts");
	config.setDataDirectory("../_data");

	// config.setMarkdownTemplateEngine("njk");
	// config.setHtmlTemplateEngine("njk");

	config.setServerOptions({
		// Open the browser automatically
		open: true,
		browser: "firefox",
		domDiff: false
	});

	/** Shared configurations and setups */
	const DATE_LANG = 'en-GB';
	const postcssConfig = await loadConfig({ env: isProduction ? 'production' : 'development' });
	const tocConfig = { tags: ['h2', 'h3'], ul: false };
	const prismPlugins = [ "toolbar", "copy-to-clipboard"];
	const imageOptions = {
		urlPath: "/images/",
		outputDir: "./public/images/",
		formats: ["webp", "png"],
		failOnError: true,
	};
	const Normalize = Prism.plugins.NormalizeWhitespace;
	const markdown = markdownIt({
		html: true,
		breaks: false,
		linkify: true,
		xhtmlOut: true,
		highlight: (code, lang) => {
			const normalized = Normalize.normalize(code);
			console.log(normalized);
			return Prism.highlight(normalized, Prism.languages[lang], lang);
		}
	}).use(markdownItAnchor);

	/* -------- PLUGINS -------- */
	config.addPlugin(InputPathToUrlTransformPlugin);
	config.addPlugin(syntaxHighlight);
	config.addPlugin(pluginTOC, tocConfig);
	config.addPlugin(eleventyImageTransformPlugin, imageOptions);
	config.addPlugin(eleventyNavigation);

	/* External watch targets */
	config.addWatchTarget("components/*.js");

	// Layout aliases make templates more portable.
	config.addLayoutAlias("base", "base.njk");
	config.addLayoutAlias("items", "items.njk");
	config.addLayoutAlias("resume", "resume.njk");

	/* ------------- STYLES ------------- */
	config.addBundle("css", {
		toFileDirectory: "css",
		transforms: [
			async function (content) {
				if (!content || !content.trim()) return content;

				try {
					return processCSS(content, this.page.inputPath, this.page?.outputPath, postcssConfig);
				} catch (err) {
					console.warn(`[css] ${this.page.inputPath}: ${err.message}`);
					return content;
				}
			}
		]
	});

	config.addTemplateFormats('css');
	config.addExtension('css', {
		outputFileExtension: 'css',
		// output to "css/" directory
		toFileDirectory: "css",
		compile: async (content, inputPath) => {
			return async ({ page }) => {
				const filename = path.basename(inputPath);
				if (filename.charAt(0) === "_") return;

				if (!content || !content.trim()) return content;

				try {
					return processCSS(content, inputPath, page?.outputPath, postcssConfig);
				} catch (err) {
					console.warn(`[css] ${inputPath}: ${err.message}`);
					return content;
				}
			};
		},
		compileOptions: {
			permalink: function (_, inputPath) {
				return () => path.join("css", path.basename(inputPath));
			}
		}
	});

	/* ------------- SCRIPTS ------------- */
	config.addBundle("js", { toFileDirectory: "js" });

	// Set-up the markdown library with custom config settings above
	config.setLibrary('md', markdown);

	// Create collections for content inside directories
	CONTENT_DIRS.forEach(collection => {
		config.addCollection(collection, function (collectionApi) {
			// Exclude the index file from the collection
			return collectionApi.getFilteredByGlob(`pages/${collection}/*`).filter(item => item.url !== `/${collection}/`);
		});
	});

	config.addShortcode("image", async function (src, alt, widths = [320, 320], sizes = "") {
		return Image(src, {
			...imageOptions,
			urlPath: "../public/images/",
			widths,
			returnType: "html",
			htmlOptions: {
				imgAttributes: { alt, sizes }
			}
		});
	});

	/* ------------- FILTERS ------------- */
	config.addFilter("toISOString", customFilters.toISOString);
	config.addFilter("year", customFilters.yearFormat);
	config.addFilter("long", (date) => customFilters.customDateFormat(date, { day: 'numeric', month: 'long', year: 'numeric' }, DATE_LANG));
	config.addFilter("short", (date) => customFilters.customDateFormat(date, { month: 'short', year: 'numeric' }, DATE_LANG));
	config.addFilter("featured", customFilters.featured);
	config.addFilter("groupByCompany", customFilters.groupByCompany);
	config.addFilter("first", customFilters.firstWord);
	config.addFilter("last", customFilters.lastWord);
	config.addFilter("clean", customFilters.trimWhitespace);
	config.addFilter("keys", customFilters.keys);
	config.addFilter("digitsOnly", customFilters.digitsOnly);
	config.addFilter("md", (string) => {
		if (!string || typeof string !== 'string') return string;

		// If newlines are present as strings, convert them
		const paragraphs = string.split('\\n\\n')?.map(paragraph => `<p>${paragraph.replace(/\\n/g, '<br>').trim()}</p>`);
		if (!paragraphs || paragraphs.length === 0) return string;

		return markdown.render(paragraphs.join(''));
	});

	/* Copy assets directly to the publish directory */
	const dependencyAssets = {
		[`${NODE_MODULES_PATH}/prismjs/themes/prism.${isProduction ? 'min.css' : 'css'}`]: `css/prism.css`,
		[`${NODE_MODULES_PATH}/prism-themes/themes/prism-one-light.${isProduction ? 'min.css' : 'css'}`]: `css/prism-one-light.css`,
		[`${NODE_MODULES_PATH}/prism-themes/themes/prism-one-dark.${isProduction ? 'min.css' : 'css'}`]: `css/prism-one-dark.css`,

		[`${NODE_MODULES_PATH}/prismjs/prism.js`]: "js/prism.js",
		...prismPlugins.reduce((plugins,plugin) => {
			plugins[`${NODE_MODULES_PATH}/prismjs/plugins/${plugin}/prism-${plugin}.${isProduction ? 'min.js' : 'js'}`] = `js/prism-${plugin}.js`;
			return plugins;
		}, {}),
	};
	config.addPassthroughCopy({
		...dependencyAssets,
		"pages/assets/favicon.*": "/",
		"pages/js/*.js": "js/",
		"components/*.js": "js/components/"
	});

	config.addTransform("prettier", function (content) {
		if ([".html", ".xml", ".svg"].includes(path.extname(this.page.outputPath || ""))) {
			return prettier.format(content, {
				bracketSameLine: true,
				printWidth: 512,
				parser: "html",
				tabWidth: 2
			});
		}

		// If not an HTML output, return content as-is
		return content;
	});

	if (isProduction) {
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
};
