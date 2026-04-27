/** @type {import('@11ty/eleventy/TemplateConfig').TemplateConfig} */
export default {
    tags: ["services"],
    layout: "base",
    listing_url: "/services/",
	permalink: function ({ page }) {
		return `/services/${page.fileSlug}/index.html`;
	},
};
