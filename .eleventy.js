const path = require("path");
const sass = require("sass");
const Image = require("@11ty/eleventy-img");
const { parseDocument, DomUtils } = require("htmlparser2");
const render = require("dom-serializer").default;

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

  // Image optimization transform — runs after HTML is built, before write to _site
  // Finds <img data-optimize> tags, replaces with <picture> using eleventy-img
  eleventyConfig.addTransform("optimizeImages", async function (content) {
    // Only process HTML files
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }

    const dom = parseDocument(content, { decodeEntities: false });
    const imgs = DomUtils.findAll(
      (el) => el.type === "tag" && el.name === "img" && el.attribs["data-optimize"] !== undefined,
      dom.children
    );

    // No optimizable images on this page — return as-is
    if (imgs.length === 0) return content;

    // Process each img in parallel
    await Promise.all(imgs.map(async (img) => {
      const publicSrc = img.attribs["src"];           // e.g. /assets/images/bmtx--foo.png
      const type = img.attribs["data-figure-type"] || "desktop";
      const alt = img.attribs["alt"] || "";
      const sizes = img.attribs["data-sizes"] || "100vw";
      const role = img.attribs["role"] || null;

      // Resolve public path back to source file on disk
      const sourceSrc = publicSrc.replace(/^\/assets\/images\//, "src/assets/images/");
      const inputPath = path.join(process.cwd(), sourceSrc);

      const widths = type === "mobile"
        ? [400, 800, 1200]
        : [800, 1200, 1600, 2000];

      let metadata;
      try {
        metadata = await Image(inputPath, {
          widths,
          formats: ["avif", "webp", "jpeg"],
          outputDir: "_site/assets/images/",
          urlPath: "/assets/images/",
          filenameFormat: function (id, src, width, format) {
            const name = path.basename(src, path.extname(src));
            return `${name}-${width}w.${format}`;
          },
        });
      } catch (e) {
        // Leave a comment in the HTML, leave the original img in place
        console.error(`[optimizeImages] Failed to process ${publicSrc}: ${e.message}`);
        return;
      }

      // Build imageAttributes — role="presentation" if no meaningful alt
      const imageAttributes = {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
        ...(role ? { role } : {}),
      };

      // Generate the <picture> HTML string
      const pictureHTML = Image.generateHTML(metadata, imageAttributes);

      // Parse the generated picture markup into DOM nodes
      const picturedom = parseDocument(pictureHTML, { decodeEntities: false });

      // Replace the <img> node in the tree with the <picture> nodes
      const parent = img.parent;
      const idx = parent.children.indexOf(img);
      parent.children.splice(idx, 1, ...picturedom.children);
    }));

    return render(dom, { decodeEntities: false });
  });

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
