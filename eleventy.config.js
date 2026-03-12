import path from "node:path";
import { writeFile } from "node:fs/promises";

import postcss from "postcss";
import loadConfig from "postcss-load-config";
import { minify } from "html-minifier";
import dotenv from "dotenv";

import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventyNavigation from "@11ty/eleventy-navigation";

import brokenLinks from "eleventy-plugin-broken-links";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginTOC from "eleventy-plugin-toc";

/** @param {import('@11ty/eleventy')} config */
export default async function (config) {
	dotenv.config();
	config.setDataFileBaseName("index");

	config.addWatchTarget("pages/background.svg");
	config.addWatchTarget("pages/logo.svg");
	config.addWatchTarget("components/*.js");

	// Layout aliases make templates more portable.
	config.addLayoutAlias("base", "layouts/base.njk");
	config.addLayoutAlias("foundation", "layouts/foundation.njk");
	config.addLayoutAlias("post", "layouts/post.njk");
	config.addLayoutAlias("proposal", "layouts/proposal.njk");
	config.addLayoutAlias("resume", "layouts/resume.njk");

	config.ignores.add("README.md");
	config.ignores.add("**/CLAUDE.md");

	config.addPlugin(eleventyNavigation);

	const styles = await loadConfig({ env: process.env.ELEVENTY_ENV });
	const processCSS = async function (content, inputPath, outputPath) {
		const parsed = path.parse(inputPath);

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
			async function (content) {
				if (!content?.trim()) return content;
				try {
					return await processCSS(content, this.page.inputPath, this.page?.outputPath);
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
		compile: async (inputContent, inputPath) => {
			return async ({ page }) => {
				return processCSS(inputContent, inputPath, page?.outputPath);
			};
		},
		compileOptions: {
			permalink: function (_, inputPath) {
				return () => path.join("css", path.basename(inputPath));
			}
		}
	});

	config.addBundle("js", {
		toFileDirectory: "js",
		transforms: [
			async function (content) {
				return content;
			}
		]
	});

	const markdown = markdownIt({
		html: true,
		breaks: true,
		linkify: true,
	});

	config.setLibrary('md', markdown.use(markdownItAnchor));

	// Create collections for content inside directories
	['posts', 'proposals'].forEach(collection => {
		config.addCollection(collection, function (collectionApi) {
			// Exclude the index file from the collection
			return collectionApi.getFilteredByGlob(`pages/${collection}/*`).filter(item => item.url !== `/${collection}/`);
		});
	});

	config.addPlugin(InputPathToUrlTransformPlugin);
	config.addPlugin(syntaxHighlight);
	config.addPlugin(brokenLinks, {
		broken: "warn",
		forbidden: "warn",
		redirects: "warn",
	});
	config.addPlugin(pluginTOC, {
		tags: ['h2', 'h3'],
		ul: false,
	});

	const imageOptions = {
		urlPath: "/images/",
		outputDir: "./public/images/",
		formats: ["webp", "png"],
		failOnError: true,
	};

	// Resume: Eleventy image optimization
	config.addPlugin(eleventyImageTransformPlugin, imageOptions);

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

	/**
	 * Convert a string date to an ISO string for use in HTML metadata
	 * @param {string} date - The date to convert
	 * @returns {string} The ISO string
	 */
	config.addFilter("toISOString", (date) => {
		return date ? new Date(date).toISOString() : '';
	});

	/**
	 * Convert a string date to a year for use in HTML metadata
	 * @param {string} date - The date to convert
	 * @returns {string} The year
	 */
	config.addFilter("yearFormat", (date) => {
		return date ? new Date(date).getFullYear() : '';
	});

	/**
	 * Convert a string date to a month and year for use in HTML metadata
	 * @param {string} date - The date to convert
	 * @returns {string} The month and year
	 */
	config.addFilter("shortDate", (date) => {
		if (date === 'present') return date;
		return date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
	});

	/**
	 * Convert e-mail with alias'ed @ symbol ("-at-") to a valid e-mail address
	 * @param {string} email - The e-mail address to convert
	 * @returns {string} The converted e-mail address
	 */
	config.addFilter("toEmail", (email) => {
		return email ? email.replace(/-at-/g, '@').replace(/\s/g, '').toLowerCase() : '';
	});

	/**
	 * Filter to get featured items from a collection
	 * @param {object[]} value - The collection to filter
	 * @returns {object[]} The featured items
	 */
	config.addFilter("featured", function (value) {
		return value?.filter(item => {
			if (item.data?.featured) return true;
			if (item.data?.tags?.includes('featured')) return true;
			if (item.featured) return true;
			return false;
		});
	});

	// Group experience entries by company for timeline display
	config.addFilter("groupByCompany", function(experience) {
		if (!experience?.length) return [];

		const groups = new Map();

		for (const job of experience) {
			const key = job.company;
			if (!groups.has(key)) {
				groups.set(key, {
					company: key,
					category: job.category,
					featured: false,
					roles: []
				});
			}
			const group = groups.get(key);
			group.roles.push(job);
			if (job.featured) group.featured = true;
		}

		for (const group of groups.values()) {
			// Sort roles by start-date descending (most recent first)
			group.roles.sort((a, b) => {
				const dateA = a["start-date"] || "";
				const dateB = b["start-date"] || "";
				if (dateA === "present") return -1;
				if (dateB === "present") return 1;
				return dateB.localeCompare(dateA);
			});

			// Compute company-wide date range
			let earliest = null;
			let latest = null;

			for (const role of group.roles) {
				const start = role["start-date"];
				const end = role["end-date"];

				if (start && start !== "present") {
					if (!earliest || start < earliest) earliest = start;
				}

				if (end === "present") {
					latest = "present";
				} else if (end && latest !== "present") {
					if (!latest || end > latest) latest = end;
				}
			}

			group["start-date"] = earliest;
			group["end-date"] = latest;
		}

		return Array.from(groups.values());
	});

	// Resume filters
	config.addFilter("first", (string) => {
		return string?.split(' ')?.[0];
	});
	config.addFilter("last", (string) => {
		return string?.split(' ')?.[string.split(' ').length - 1];
	});
	config.addFilter("clean", (string) => {
		return string?.replace(/\s/g, '');
	});

	config.addFilter("md", (string) => {
		if (!string || typeof string !== 'string') return string;

		// If newlines are present as strings, convert them
		const paragraphs = string.split('\\n\\n')?.map(paragraph => `<p>${paragraph.replace(/\\n/g, '<br>').trim()}</p>`);
		if (!paragraphs || paragraphs.length === 0) return string;

		return markdown.render(paragraphs.join(''));
	});

	/**
	 * Filter to format a date for use in blog posts
	 * @param {string} date - The date to format
	 * @returns {string} The formatted date
	 */
	config.addFilter("postDate", (date) => {
		return date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
	});

	/**
	 * Filter to get only digits from a string
	 * @param {string} string - The string to filter
	 * @returns {string} The string with only digits
	 */
	config.addFilter("digitsOnly", (string) => {
		return string?.replace(/\D/g, '');
	});

	config.addPassthroughCopy({
		"node_modules/prismjs/themes/prism.css": "css/prism.css",
		"node_modules/prism-themes/themes/prism-one-light.css": "css/prism-one-light.css",
		"node_modules/prism-themes/themes/prism-one-dark.css": "css/prism-one-dark.css",
		"node_modules/prismjs/prism.js": "js/prism.js",
		"pages/favicon.*": "/",
		"pages/**/*.js": "js/",
		"components/*.js": "js/components/"
	});

	config.setServerOptions({
		// Open the browser automatically
		open: true,
		browser: "firefox",
		domDiff: false
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
		templateFormats: ["html", "njk", "md", "11ty.js", "11ty.json"],
	};
};
