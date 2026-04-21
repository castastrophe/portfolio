/** @type {import('@11ty/eleventy/TemplateConfig').TemplateConfig} */
export default {
    tags: ["proposals"],
    layout: "items",
    listing_url: "/proposals/",
    sales_pitch: "Did you find this proposal interesting? I'm available for speaking, workshops, or training.",
	permalink: function ({ page }) {
		return `/proposals/${page.fileSlug}/index.html`;
	},
};
