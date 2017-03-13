class App {
  constructor() {
    // TODO:
    // this should be all the json files 
    // concatenated and make available to 
    // this member field
    // this needs to be done by build package
    this.content = {};
  }

  get list() {
    return this.content;
  }
  set list(content) {
    this.content = content;
  }
}

// Application Instance
const app = new App();
console.log(app);
