const path = require("path");
const sass = require("sass");

module.exports = function (eleventyConfig) {
  // Compile SCSS natively — no intermediate output folder needed
  eleventyConfig.addExtension(["scss", "sass"], {
    outputFileExtension: "css",
    key: "scss",
    compile: function (inputContent, inputPath) {
      return async (data) => {
        if (path.basename(inputPath).startsWith("_")) return;
        const result = await sass.compileStringAsync(inputContent, {
          loadPaths: [path.dirname(inputPath)],
        });
        this.addDependencies(inputPath, result.loadedUrls);
        return result.css;
      };
    },
  });

  eleventyConfig.addTemplateFormats("scss");

  // Pass through static assets (scss compiled above, css is build output)
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/js");

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
