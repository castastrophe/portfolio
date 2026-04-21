/** @type {import('@11ty/eleventy/TemplateConfig').TemplateConfig} */
export default {
    tags: ["posts"],
    layout: "items",
    listing_url: "/posts/",
    sales_pitch: "Did you find this post helpful? I'm available for full-time, consulting, speaking, workshops, or training.",
	permalink: function ({ page }) {
        const date = new Date(page.date);
		return `/posts/${date.toISOString().split('T')[0]}/index.html`;
	},
};
