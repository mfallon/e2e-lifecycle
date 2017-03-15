var utils = require('./_utils'),
  nodeUtils = require('util'),
  rollup = require( 'rollup' ),
  mkdirp = require('mkdirp'),
  babel = require('babel-core'),
  fs = require('fs')
  // async = require('async'),
  // path = require('path'),
  // minimatch = require('minimatch')

// represent our files in a heirarchical manner
class Node {
  constructor(data) {
    this.data = data;
    this.children = [];
  }

  addChild(node, index) {
    // Only assign child if not exists
    if (!this.hasChild(index)) {
      this.children[index] = node;
    } else {
      // we have to update data at this node
      if (!this.children[index].hasData() && node.hasData()) {
        this.children[index].data = Object.assign(this.children[index].data, node.data);
      }
    }
    // link back up with recurse
    return this.children[index];
  }

  hasChild(index) {
    return typeof this.children[index] !== 'undefined';
  }

  hasData(node, index) {
    return Object.keys(this.data).length > 0;
  }
}

class Tree {
  constructor(data) {
    this.rootNode = new Node(data);
  }

  // create leaf node at specified address 
  add(addr, data) {
    (function recurse(currNode, currAddr) {
      if (currAddr.length) {
        // pluck a member off the beginning of address
        const currLevel = parseInt(currAddr.shift());
        // if we've reached the leaf, use data
        const nextNode = !currAddr.length ? new Node(data) : new Node({});
        // add in and next
        return recurse(currNode.addChild(nextNode, currLevel), currAddr);
      } else {
        // get back
        return currNode;
      }
    })(this.rootNode, addr.slice());
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
          // read content dir and create a sorted array based on filename convention
          const { outputFile, indexFile } = global.config;
          const { dir, delim, regEx } = global.config.contentFile;
          const tree = new Tree({
            name: 'ROOT'
          });
          const content = utils.listFiles(`${ dir }`, false);
          // iterate over directory files
          content.forEach((file, index) => {
            // get address part of filename
            const rematch = regEx.exec(file);
            if (rematch && rematch.length === 4) {
              let [ match, addr, name, ext ] = rematch;
              addr = addr.substring(0, addr.length - 1).split(delim);
              tree.add(addr, {
                name, 
                ext
              });
            } else {
              utils.print(`Error: cannot match file ${ file }`, 'warning');
            }
          });

          console.log(nodeUtils.inspect(tree, {showHidden: false, depth: null}));

          fs.writeFileSync(`./dist/${ outputFile }.js`, result, 'utf8')
          fs.createReadStream(`./src/${ indexFile }.html`)
            .pipe(fs.createWriteStream(`./dist/${ indexFile }.html`));

          resolve();
        } catch (e) {
          reject(e)
        }
      })

    }).catch(e =>{ utils.print(e, 'error') })
  })

}
