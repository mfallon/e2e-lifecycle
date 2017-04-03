const utils = require('./_utils');
const nodeUtils = require('util');
const rollup = require( 'rollup' );
const mkdirp = require('mkdirp');
const babel = require('babel-core');
const fs = require('fs');
const marked = require('marked');
const sass = require('node-sass');

// represent a branch or leaf
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

  hasChildren() {
    return this.children.length > 0;
  }

  hasData(node, index) {
    return Object.keys(this.data).length > 0;
  }
}

// represent our files in a heirarchical manner
class Tree {
  constructor(data) {
    this.rootNode = new Node(data);
    this.json = {};
  }

  // create leaf node at specified address
  add(addr, data) {
    (function recurse(currNode, currAddr) {
      if (currAddr.length) {
        // pluck a member off the beginning of address
        const currLevel = parseInt(currAddr.shift(), 10);
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

  toJSON() {
    const { data, children } = this.rootNode;
    const { name } = data;
    this.json = {
      name,
      props: data
    };
    if (children.length) {
      this.json['children'] = (function recurse(kids) {
        return kids.map(kid => {
          const { data } = kid;
          const { name } = data;
          if (kid.hasChildren()) {
            return {
              name,
              props: data,
              children: recurse(kid.children)
            }
          } else {
            return {
              name,
              props: data
            };
          }
        });
      })(children);
    }
    return this.json;
  }
}

// Queue implementation which will notify when all promises are resolved
class FileQueue {
  constructor() {
    this.fs = require('fs');
    this.tasks = [];
  }
  readFile(file, callback) {
    this.tasks.push(
      new Promise((resolve, reject) => {
        try {
          this.fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        } catch(err) {
          reject(err);
        }
      })
      .then(data => {
        return callback(data);
      }, err => {
        // TODO: test the error
        utils.print(`Error reading file ${ file }: ${ e }`, 'error');
        return null;
      })
    );
  }
  checkResolved() {
    return Promise.all(this.tasks);
  }
}

module.exports = function(options) {

  // delete the old ./dist folder
  utils.clean('./dist')

  /**
   * Create a promise based on the mainAppCompileResult of the webpack compiling script
   */

  return new Promise(function(resolve, reject) {

    rollup.rollup({
      // The bundle's starting point. This file will be
      // included, along with the minimum necessary code
      // from its dependencies
      entry: `./src/js/${ global.config.inputFile }.js`
    }).then( function ( bundle ) {

      // convert to valid es5 code with babel
      var mainAppCompileResult = babel.transform(
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
      ).code;

      mkdirp('./dist', function() {
        try {
          // read content dir and create a sorted array based on filename convention
          const { dir, delim, regEx } = global.config.contentFile;
          const content = utils.listFiles(`${ dir }`, false);
          const q = new FileQueue();
          // iterate over directory files
          content.forEach((file, index) => {
            // get address part of filename
            const rematch = regEx.exec(file);
            if (rematch && rematch.length === 4) {
              let [ match, addr, name, ext ] = rematch;
              addr = addr.substring(0, addr.length - 1).split(delim);
              name = utils.capitalize(name, delim);
              // add file to FileQueue, but check if resolved later
              q.readFile(file, data => {
                return {
                  addr,
                  name,
                  ext,
                  content: JSON.stringify(data)
                }
              });
            } else {
              utils.print(`Error: cannot match file ${ file }`, 'warning');
            }
          });

          const { inputFile, outputFile, indexFile, globalContent, d3version } = global.config;

          // Instantiate tree data structure
          const tree = new Tree({
            name: 'ROOT'
          });

          // Now ask q to return when all promises have fulfilled
          q.checkResolved().then(
            allFilesResolved => {
              if (allFilesResolved.length) {
                allFilesResolved.forEach(fileData => {
                  const { addr, name, ext, content } = fileData; 
                  tree.add(addr, {
                    name,
                    ext,
                    content
                  });
                });


                // now write files to output directory with content
                const contentJSON = `var ${ globalContent }=${nodeUtils.inspect(tree.toJSON(), {depth: null})};`
                fs.writeFileSync(`./dist/${ outputFile }.content.js`, contentJSON, 'utf8');
                
                // TODO: explore how to bundle this lib rather than this straight copy
                // will only need certain modules out of d3 lib
                // pull d3 library into export dir
                // rollup is already being used for this
                mkdirp('./dist/lib', () => {
                  fs.createReadStream(`./tools/d3/d3.v${d3version}.js`)
                    .pipe(fs.createWriteStream('./dist/lib/d3.js'));
                });

                // SCSS build
                // node-sass --include-path scss src/scss/app.scss dist/css/app.scss
                mkdirp('./dist/css', () => {
                  sass.render({
                    file: `./src/scss/${ inputFile }.scss`,
                    outFile: `./dist/css/${ outputFile }.css`,
                    outputStyle: 'nested',
                  }, (error, result) => {
                    if (error) {
                      utils.print(error.status, 'error');
                      utils.print(error.column, 'error');
                      utils.print(error.message, 'error');
                      utils.print(error.line, 'error');
                    } else {
                      fs.writeFile(`./dist/css/${ outputFile }.css`, result.css, (err) => {
                        if (err) {
                          utils.print('css file could not be written to disk', 'error');
                        } else {
                          utils.print(`css file written to ./dist/css/${ outputFile }.css`, 'error');
                        }
                      });
                    }
                  });
                });

                // resolve outer main resolve
                fs.writeFileSync(`./dist/${ outputFile }.js`, mainAppCompileResult, 'utf8');
                fs.createReadStream(`./src/${ indexFile }.html`)
                  .pipe(fs.createWriteStream(`./dist/${ indexFile }.html`));

                utils.print('Finished compiling files!', 'confirm');
                resolve();

              } else {
                utils.print('no files to process!', 'warn');
              }
            }, 
            rejected => {
              utils.print(`Encountered error reading files ${ rejected }`, 'error');
            }
          ).catch(rejected => {
            utils.print(`Encountered error reading files ${ rejected }`, 'error');
          });


        } catch (e) {
          reject(e)
        }
      })

    }).catch(e =>{ utils.print(e, 'error') })
  })

}
