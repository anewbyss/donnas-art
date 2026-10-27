import { HtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

// Turns "Abstract & Bold" into "abstract-bold" for web addresses.
const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const STATUS_LABELS = {
  available: "Available",
  prints: "Prints available",
  inquire: "Price on request",
  sold: "Sold",
  nfs: "Not for sale",
};

export default function (eleventyConfig) {
  // Uploaded images and site assets are copied as-is (full-size originals
  // are used for the zoom view and for social-media share previews).
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // Automatically creates small, fast-loading versions of every <img>.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "auto"],
    widths: [480, 960, 1600],
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async" },
      pictureAttributes: {},
    },
    failOnError: false,
  });

  // Lets the site live in a sub-folder (e.g. username.github.io/donnas-art/).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  const isPublished = (item) => !item.data.draft;
  const byNewest = (a, b) =>
    (b.data.order ?? 0) - (a.data.order ?? 0) || b.date - a.date;

  eleventyConfig.addCollection("artworks", (api) =>
    api.getFilteredByGlob("src/artworks/*.md").filter(isPublished).sort(byNewest)
  );

  eleventyConfig.addCollection("categories", (api) =>
    api
      .getFilteredByGlob("src/categories/*.md")
      .sort(
        (a, b) =>
          (a.data.order ?? 99) - (b.data.order ?? 99) ||
          a.data.title.localeCompare(b.data.title)
      )
  );

  eleventyConfig.addFilter("slugify", slugify);
  eleventyConfig.addFilter("statusLabel", (s) => STATUS_LABELS[s] || "");
  eleventyConfig.addFilter("toList", (v) => (Array.isArray(v) ? v : v ? [v] : []));

  // Artworks in a given category (categories are matched by their title).
  eleventyConfig.addFilter("inCategory", (artworks, title) =>
    artworks.filter((a) =>
      (a.data.categories || []).map(slugify).includes(slugify(title))
    )
  );

  // Category pages that a piece belongs to.
  eleventyConfig.addFilter("categoriesFor", (categories, names) => {
    const wanted = (names || []).map(slugify);
    return categories.filter((c) => wanted.includes(slugify(c.data.title)));
  });

  // Groups collections under headings: Styles, Eras, Themes, then anything else.
  eleventyConfig.addFilter("groupCategories", (categories) => {
    const names = { Style: "Styles", Era: "Eras", Theme: "Themes" };
    const groups = new Map(Object.keys(names).map((k) => [k, []]));
    for (const c of categories) {
      const key = names[c.data.group] ? c.data.group : "More";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c);
    }
    return [...groups]
      .filter(([, items]) => items.length)
      .map(([key, items]) => ({ key, name: names[key] || "More collections", items }));
  });

  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addFilter("featured", (artworks) =>
    artworks.filter((a) => a.data.featured)
  );

  eleventyConfig.addFilter("withExtras", (main, extras) =>
    [main, ...(Array.isArray(extras) ? extras : [])].filter(Boolean)
  );

  eleventyConfig.addFilter("related", (artworks, url, limit = 4) => {
    const current = artworks.find((a) => a.url === url);
    if (!current) return [];
    const cats = (current.data.categories || []).map(slugify);
    return artworks
      .filter((a) => a.url !== current.url)
      .filter((a) => (a.data.categories || []).some((c) => cats.includes(slugify(c))))
      .slice(0, limit);
  });

  eleventyConfig.addFilter("neighbours", (artworks, url) => {
    const i = artworks.findIndex((a) => a.url === url);
    return {
      prev: i > 0 ? artworks[i - 1] : null,
      next: i >= 0 && i < artworks.length - 1 ? artworks[i + 1] : null,
    };
  });

  eleventyConfig.addFilter("money", (amount, currency = "USD") => {
    if (amount === undefined || amount === null || amount === "") return "";
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  });

  // Absolute link, needed for share buttons and previews on social media.
  eleventyConfig.addFilter("absolute", (path, base) => {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    return String(base || "").replace(/\/$/, "") + "/" + String(path).replace(/^\//, "");
  });

  eleventyConfig.addFilter("plain", (html = "") =>
    String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  );
  eleventyConfig.addFilter("truncate", (s = "", n = 160) =>
    s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
