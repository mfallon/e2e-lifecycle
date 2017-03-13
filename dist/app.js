(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('App', ['module', 'glob'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('glob'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.glob);
    global.App = mod.exports;
  }
})(this, function (module, glob) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  console.log(glob);

  var app = function () {
    function app() {
      _classCallCheck(this, app);

      this.config = {
        content: 'json/*.json'
      };
    }

    _createClass(app, [{
      key: 'loadFiles',
      value: function loadFiles() {
        this.files = glob(this.config.content, {}, this.loaded);
      }
    }, {
      key: 'loaded',
      value: function loaded() {
        console.log("Loaded!", this.list);
      }
    }, {
      key: 'list',
      get: function get() {
        return this.files;
      },
      set: function set(files) {
        this.files = files;
      }
    }]);

    return app;
  }();

  module.exports = app;
});