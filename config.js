module.exports = {
  inputFile: 'app',
  outputFile: 'app',
  namespace: 'App',
  indexFile: 'index',
  contentFile: {
    dir: './content',
    delim: '_',
    regEx: /([\d_]+)(\w+)\.(\w+)/
  },
  globalContent: 'contentJSON',
  d3version: '3.3.9'
}
