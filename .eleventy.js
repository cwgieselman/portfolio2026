const Image = require("@11ty/eleventy-img");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Pass through assets
  eleventyConfig.addPassthroughCopy("src/assets");

  // Watch CSS files for changes
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/scss/");

  // Image optimization shortcode
  eleventyConfig.addNunjucksAsyncShortcode(
    "image",
    async function (src, alt, sizes = "900px") {
      let metadata = await Image(src, {
        widths: [400, 800, 1200, 1800], // Generate multiple sizes
        formats: ["avif", "webp", "jpeg"], // Modern formats + fallback
        outputDir: "./_site/assets/images/",
        urlPath: "/assets/images/",
        filenameFormat: function (id, src, width, format, options) {
          const extension = path.extname(src);
          const name = path.basename(src, extension);
          return `${name}-${width}w.${format}`;
        },
      });

      let imageAttributes = {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
      };

      return Image.generateHTML(metadata, imageAttributes);
    },
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
