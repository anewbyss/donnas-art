export default {
  layout: "layouts/artwork.njk",
  permalink: (data) => (data.draft ? false : `/art/${data.page.fileSlug}/`),
};
