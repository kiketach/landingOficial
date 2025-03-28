const { purgeCSSPlugin } = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgeCSSPlugin({
      content: ['./index.html', './js/**/*.js'], // Archivos a analizar
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
};