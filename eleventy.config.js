import path from "node:path";
import postcss from "postcss";
import loadConfig from "postcss-load-config";

import pluginWebc from "@11ty/eleventy-plugin-webc";
import { InputPathToUrlTransformPlugin } from "@11ty/eleventy";

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	eleventyConfig.ignores.add("README.md");

    eleventyConfig.addPlugin(pluginWebc, {
		// Glob to find no-import global components
		// (The default changed from `false` in Eleventy WebC v0.7.0)
		components: "./_components/**/*.webc",

		// Adds an Eleventy WebC transform to process all HTML output
		useTransform: false,

		// Additional global data used in the Eleventy WebC transform
		transformData: {},

		// Options passed to @11ty/eleventy-plugin-bundle
		bundlePluginOptions: {},
    });

    eleventyConfig.addTemplateFormats("scss");
    eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",

		// opt-out of Eleventy Layouts
		// useLayouts: false,

		compile: async function (inputContent, inputPath) {
			let parsed = path.parse(inputPath);
			// Don’t compile file names that start with an underscore
			if(parsed.name.startsWith("_")) {
				return;
			}

            const config = await loadConfig();
            const result = await postcss(config.plugins).process(inputContent);

			// Map dependencies for incremental builds
			this.addDependencies(inputPath, result.loadedUrls);

			return async (data) => {
				return result.css;
			};
		},
	});

	eleventyConfig.addCollection("posts", function(collectionApi) {
		return collectionApi.getFilteredByGlob("pages/posts/**/*");
	});

	eleventyConfig.addPassthroughCopy("img");

	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.setServerOptions({
		domDiff: false
	});

	return {
        dir: {
            input: "pages",
            output: "public",
            includes: "../_includes",
            data: "../_data",
        },
		markdownTemplateEngine: false,
    };
};