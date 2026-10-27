export default {
  layout: "layouts/category.njk",
  permalink: (data) => `/collections/${data.page.fileSlug}/`,
};
