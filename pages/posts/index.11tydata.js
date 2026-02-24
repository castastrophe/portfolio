/** @type {import('@11ty/eleventy/TemplateConfig').TemplateConfig} */
export default {
    isPost: true,
    layout: "post",
	permalink: function ({ page }) {
        const date = new Date(page.date);
		return `/posts/${date.toISOString().split('T')[0]}/index.html`;
	},
};
