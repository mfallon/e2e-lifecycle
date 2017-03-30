// const d3 = require('d3');
// TODO: how to include d3 within App
// without having to separately link the lib from
// the index

class App {
  constructor(content) {
    this.root = d3.hierarchy(content);
    console.log(this.root);
  }
}

// Application Instance
const app = new App(contentJSON);
