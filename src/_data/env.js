import site from "./site.json" with { type: "json" };

// The public web address of the site. Set automatically when published on
// GitHub Pages; otherwise falls back to the "Website address" setting.
export default {
  siteUrl: (process.env.SITE_URL || site.url || "").replace(/\/$/, ""),
};
