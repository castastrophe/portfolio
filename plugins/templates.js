module.exports = (eleventyConfig) => {
  eleventyConfig.addPairedNunjucksShortcode(
    "section",
    (content, ...settings) => {
      const {
        classes = [],
        width,
        padding,
        color,
        layout,
        align,
        isSticky,
        style,
        id,
      } = settings[0];
      return `
    <div class="container${classes.length ? ` ${classes.join(" ")}` : ""}"${
        width ? ` data-width="${width}"` : ""
      }${padding ? ` padding="${padding}"` : ""}${
        color ? `color="${color}"` : ""
      }${id ? ` id="${id}"` : ""}${isSticky ? " sticky" : ""}${
        style ? ` style="${style}` : ""
      }>
        <div class="container-content"${layout ? ` layout="${layout}"` : ""}${
        align ? ` align="${align}"` : ""
      }>
            ${content}
        </div>
    </div>`;
    }
  );
};
