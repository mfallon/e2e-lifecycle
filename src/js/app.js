var glob = require('glob');
// const config = require('../../config');

console.log(glob);

export default class {
  constructor() {
    this.config = {
      content: 'json/*.json',
    };
    // this.files = [];
    /*
    const glob = require('glob').Glob;
    this.files = glob('json/*.json', {}, function(err, files) {
      return files;
    });
    */
  }

  get list() {
    return this.files;
  }
  set list(files) {
    this.files = files;
  }

  loadFiles() {
    this.files = glob(
      this.config.content,
      {},
      this.loaded
    );
  }

  loaded() {
    console.log("Loaded!", this.list);
  }

}
