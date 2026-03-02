import path from "node:path";
import { writeFile } from "node:fs/promises";
import postcss from "postcss";
import loadConfig from "postcss-load-config";
import { minify } from "html-minifier";

import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { InputPathToUrlTransformPlugin, RenderPlugin } from "@11ty/eleventy";
import brokenLinks from "eleventy-plugin-broken-links";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginTOC from "eleventy-plugin-toc";
import { eleventyImageTransformPlugin as imagePlugin } from "@11ty/eleventy-img";
import eleventyNavigation from "@11ty/eleventy-navigation";

// Make sure we use the same formatter logic for the dynamic content as the pre-compiled outputs
import formatter from "./pages/resume/formatter.js";

/** @param {import('@11ty/eleventy')} config */
export default async function (config) {
	config.setDataFileBaseName("index");

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
				return processCSS(content, this.page.inputPath, this.page?.outputPath);
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

	config.addCollection("posts", function (collectionApi) {
		// Exclude the index file
		return collectionApi.getFilteredByGlob("pages/posts/*");
	});

	config.addCollection("proposals", function (collectionApi) {
		// Exclude the index file
		return collectionApi.getFilteredByGlob("pages/proposals/*");
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

	// Resume: Eleventy image optimization
	config.addPlugin(imagePlugin, {
		urlPath: "/img/",
		outputDir: "./public/images/",
		failOnError: false,
	});

	config.addFilter("toISOString", formatter.toISOString);
	config.addFilter("toEmail", formatter.toEmail);
	config.addFilter("toJson", (input) => {
		return JSON.stringify(input, null, 2);
	});
	config.addFilter("featured", function (value) {
		return value?.filter(item => item.featured);
	});

	// Create a mini template for formatting start and end dates with logic
	config.addShortcode("dates", function(startDate, endDate, classPrefix = '', asTemplate = false) {
		// Either a start or end date is required to render this template
		if (!startDate && !endDate) return '';

		// as template returns mark-up without embedded content and with identifiers for keys
		// 	<span class="job-dates">
		// 	  <span data-replace-key="start-date" data-type="date"></span><span class="separator">–</span><span data-replace-key="end-date" data-type="date"></span>
		//  </span>
		return `<span class="${[classPrefix, 'dates'].filter(Boolean).join('-')}">
			${startDate ? `<span${asTemplate ? ' data-replace-key="start-date" data-type="date"' : ''}>${formatter.date(startDate)}</span>` : ''}
			${startDate && endDate ? '<span class="separator">–</span>' : ''}
			${endDate ? `<span${asTemplate ? ' data-replace-key="end-date" data-type="date"' : ''}>${formatter.date(endDate)}</span>` : ''}
		</span>`;
	});

	// Create a mini template for formatting start and end dates with logic
	config.addShortcode("years", function(startDate, endDate, classPrefix = '', asTemplate = false) {
		// Either a start or end date is required to render this template
		if (!startDate && !endDate) return '';

		// as template returns mark-up without embedded content and with identifiers for keys
		// 	<span class="job-dates">
		// 	  <span data-replace-key="start-date" data-type="date"></span><span class="separator">–</span><span data-replace-key="end-date" data-type="date"></span>
		//  </span>
		return `<span class="${[classPrefix, 'dates'].filter(Boolean).join('-')}">
			${startDate ? `<span${asTemplate ? ' data-replace-key="start-date" data-type="year"' : ''}>${formatter.year(startDate)}</span>` : ''}
			${startDate && endDate ? '<span class="separator">–</span>' : ''}
			${endDate ? `<span${asTemplate ? ' data-replace-key="end-date" data-type="year"' : ''}>${formatter.year(endDate)}</span>` : ''}
		</span>`;
	});

	config.addShortcode("contact", function(contact, label, type, icon) {
		if (!contact) return '';

		let href, content = String(contact ?? '').trim();
		if (type) {
			switch (type) {
				case 'url':
					href = `https://${formatter.noSpace(contact)}`;
					content = formatter.noSpace(contact);
					break;
				case 'phone':
					href = `tel:+1${formatter.digitsOnly(contact)}`;
					content = formatter.toPhone(contact);
					break;
				case 'email':
					href = `mailto:${formatter.toEmail(contact)}`;
					content = formatter.toEmail(contact);
					break;
			}
		}

		if (!label) {
			// Warn the build process that a label is required
			console.warn(`[Contact] Label is required for contact: ${contact} [${this.page?.inputPath}]`);
		}

		return `<div class="contact-item">
            ${icon ? `<span class="${icon}" aria-hidden="true"></span>` : ''}
            ${label ? `<span class="visually-hidden">${label}</span>` : ''}
            ${href ? `<a href="${href}">${content}</a>` : `${content}`}
		</div>`;
	});

	// Resume filters
	config.addFilter("first", formatter.first);
	config.addFilter("last", formatter.last);
	config.addFilter("clean", formatter.clean);

	config.addFilter("md", (string) => {
		return markdown?.render(string) ?? String(string);
	});

	config.addFilter("formatDate", formatter.date);

	config.addFilter("digitsOnly", formatter.digitsOnly);

	config.addPassthroughCopy({
		"node_modules/prismjs/themes/prism.css": "css/prism.css",
		"node_modules/prism-themes/themes/prism-one-light.css": "css/prism-one-light.css",
		"node_modules/prism-themes/themes/prism-one-dark.css": "css/prism-one-dark.css",
		"node_modules/prismjs/prism.js": "js/prism.js",
		"pages/resume/custom/*.json": "resume/custom/",
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
