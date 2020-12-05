module.exports = {
  sortAttributes: true,
  collapseAttributeWhitespace: true,
  collapseBooleanAttributes: {
      amphtml: false,
  },
  custom: [],
  deduplicateAttributeValues: true,
  mergeScripts: true,
  mergeStyles: true,
  removeUnusedCss: true,
  removeEmptyAttributes: true,
  removeAttributeQuotes: false,
  sortAttributesWithLists: 'alphabetical',
  minifyUrls: false,
  removeOptionalTags: false,

  collapseWhitespace: 'all',
  removeComments: 'all',
  removeAttributeQuotes: true,
  removeRedundantAttributes: true,
  removeUnusedCss: {},
  minifyCss: {
      preset: 'default',
  },
  minifySvg: {},
  minifyConditionalComments: true,
  removeOptionalTags: true,
}