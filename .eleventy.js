const Image = require("@11ty/eleventy-img");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Pass through assets
  eleventyConfig.addPassthroughCopy("src/assets");

  // Watch CSS files for changes
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/scss/");

  // Image optimization shortcode (instrumented)
  eleventyConfig.addNunjucksAsyncShortcode(
    "image",
    async function (src, alt, sizes = "900px") {
      try {
        let metadata = await Image(src, {
          widths: [400, 800, 1200, 1800],
          formats: ["avif", "webp", "jpeg"],
          outputDir: "./_site/assets/images/",
          urlPath: "/assets/images/",
          filenameFormat: function (id, src, width, format) {
            const extension = path.extname(src);
            const name = path.basename(src, extension);
            return `${name}-${width}w.${format}`;
          },
        });

        return Image.generateHTML(metadata, {
          alt,
          sizes,
          loading: "lazy",
          decoding: "async",
        });
      } catch (err) {
        const msg = String(err && err.message ? err.message : err).replaceAll(
          "--",
          "—",
        );
        console.error("[image shortcode error]", msg);
        return `<!-- image shortcode error: ${msg} | src=${src} -->`;
      }
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
