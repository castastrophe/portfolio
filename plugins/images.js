const path = require("node:path");
const eleventyImage = require("@11ty/eleventy-img");

module.exports = (eleventyConfig) => {
  function relativeToInputPath(inputPath, relativeFilePath) {
    let split = inputPath.split("/");
    split.pop();

    return path.resolve(split.join(path.sep), relativeFilePath);
  }

  // Eleventy Image shortcode
  // https://www.11ty.dev/docs/plugins/image/
  eleventyConfig.addAsyncShortcode(
    "image",
    async function imageShortcode(src, ...attrs) {
      const { widths } = attrs[0] || {};
      let formats = ["webp", "auto", "jpeg", "png"];
      let file = relativeToInputPath(this.page.inputPath, src);
      let metadata = await eleventyImage(file, {
        widths: widths || ["auto"],
        formats,
        outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
      });

      // TODO loading=eager and fetchpriority=high
      let imageAttributes = {
        loading: "lazy",
        decoding: "async",
        ...(attrs[0] || {}),
      };
      return eleventyImage.generateHTML(metadata, imageAttributes);
    }
  );
};
