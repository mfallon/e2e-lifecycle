var utils = require('./_utils'),
  rollup = require( 'rollup' ),
  mkdirp = require('mkdirp'),
  babel = require('babel-core'),
  fs = require('fs')
  // async = require('async'),
  // path = require('path'),
  // minimatch = require('minimatch')


module.exports = function(options) {

  // delete the old ./dist folder
  utils.clean('./dist')

  /**
   * Create a promise based on the result of the webpack compiling script
   */

  return new Promise(function(resolve, reject) {

    rollup.rollup({
      // The bundle's starting point. This file will be
      // included, along with the minimum necessary code
      // from its dependencies
      entry: `./src/js/${ global.config.inputFile }.js`
    }).then( function ( bundle ) {

      // convert to valid es5 code with babel
      var result = babel.transform(
        // create a single bundle file
        bundle.generate({
          format: 'cjs'
        }).code,
        {
          moduleId: global.library,
          moduleIds: true,
          comments: false,
          presets: ['es2015'],
          plugins: ['transform-es2015-modules-umd']
        }
      ).code

      mkdirp('./dist', function() {
        try {
          fs.writeFileSync(`./dist/${ global.config.outputFile }.js`, result, 'utf8')
          fs.createReadStream(`./src/${ global.config.index }.html`)
            .pipe(fs.createWriteStream(`./dist/${ global.config.index }.html`));
          // TODO: need to package up json into app.content.js
          /*
          glob(global.config.contentDir + '/*.json', {}, function (er, files) {
            if (er) {
              utils.print(`Error parsing json content`, 'error')
              return null
            }
            let rootNode = '';
            files.forEach(file => {
              fs.readFile(file, 'utf8', (err, data) => {
                rootNode += JSON.stringify(data)
              })
            });
            // TODO: need to setup a global accessible from App
            utils.print(`writing content to ${ global.config.outputFile }.content.js`, 'cool')
            fs.writeFileSync(`./dist/${ global.config.outputFile }.content.js`, '', 'utf8')
          })
          */

          // MODULE: read content dir and create a sorted array based on filename convention
          const content = utils.listFiles(`${ global.config.contentDir }`, false)
          const contentTree = []

          if (content.length > 0) {
            // assumes unsorted list
            content.forEach((file, index) => {
              // regex match file
              const match = /(\d_\d_\d_\d)_(\w+)\.(\w+)$/.exec(file)
              if (match && match.length) {
                const [ filename, address, contentname, ext] = match
                // insert into array at it's address
                const addrParts = /(\d)_(\d)_(\d)_(\d)/.exec(address)
                if (addrParts && addrParts.length) {
                  // this should generate an N-level array
                  const [ l0, l1, l2, l3 ] = addrParts
                  // populate
                  contentTree.push({
                    filename,
                    address,
                    contentname,
                    ext
                  })
                }
              }
            });
          }
          console.log(contentTree)
          resolve()
        } catch (e) {
          reject(e)
        }
      })

    }).catch(e =>{ utils.print(e, 'error') })
  })

}
