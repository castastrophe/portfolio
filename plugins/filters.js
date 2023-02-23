const { DateTime } = require("luxon");

module.exports = (eleventyConfig) => {
  eleventyConfig.addFilter("startsWith", (value, find) => {
    if (value.startsWith(find)) return true;
    return false;
  });

  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      format || "yyyy LLLL dd"
    );
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  // eleventyConfig.addFilter("head", (array, n) => {
  //     if(!Array.isArray(array) || array.length === 0) return [];
  //     if( n < 0 ) return array.slice(n);
  //     return array.slice(0, n);
  // });

  // Return all the tags used in a collection
  // eleventyConfig.addFilter("getAllTags", collection => {
  //     let tagSet = new Set();
  //     for(let item of collection) {
  //         (item.data.tags || []).forEach(tag => tagSet.add(tag));
  //     }
  //     return Array.from(tagSet);
  // });

  eleventyConfig.addFilter("filterTagList", (tags) =>
    (tags || []).filter(
      (tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
    )
  );
};
