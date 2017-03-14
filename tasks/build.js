var utils = require('./_utils'),
  rollup = require( 'rollup' ),
  mkdirp = require('mkdirp'),
  babel = require('babel-core'),
  fs = require('fs')
  // async = require('async'),
  // path = require('path'),
  // minimatch = require('minimatch')

// reprent our files in a heirarchical manner
class Node {
  constructor(data) {
    this.data = data;
    this.parent = null;
    this.children = [];
  }

  hasChild(index) {
    return typeof this.children[index] !== "undefined";
  }

  addChild(node, index) {
    this.children[index] = node;
  }
}

class Tree {
  constructor(data) {
    this.rootNode = new Node(data);
  }

  add(data, index) {
    this.rootNode.addChild(new Node(data), index);
  }

  addChild() {
    this.rootNode.addChild(new Node(data), ...this.args);
  }

  remove(data, parent, traversal) {
  }

  findIndex(arr, data) {
  }

  traverseDepth(callback) {
    (function recurse(currNode) {
      currNode.children.forEach(child => recurse(child));
      callback(currNode);
    })(this._root);
  }

  traverseBreadth(callback) {
  }
}


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
          const tree = new Tree({
            name: 'rootNode'
          });

          if (content.length > 0) {
            // assumes sorted list
            content.forEach((file, index) => {
              // get address part of filename
              let addr = /(?:\d_)+/.exec(file)
              if (addr && addr.length) {
                addr = addr.pop().split('_')
                // clip last element which is '_'
                addr.length = addr.length - 1;
                let last = null; 
                addr.forEach((pos, level, arr) => {
                  if (level === arr.length -1) {
                    // this is the last level
                    // so insert node data here
                  } else {
                    // insert child at this level at pos
                    tree.add({}, pos);
                    // maybe tree should traverse children with address?
                  }
                
                  // console.log(index, ':', level);
                  // check whethere a node exists at this tree level
                  // in effect asking if a child exists at index
                  // tree.add({}, index);
                  /*
                  tree.add({
                    name: file
                  }, level);
                  */
                })
              }
            });
          }

          console.log(tree);
          resolve()
        } catch (e) {
          reject(e)
        }
      })

    }).catch(e =>{ utils.print(e, 'error') })
  })

}
