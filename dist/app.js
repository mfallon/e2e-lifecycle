(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('App', ['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.App = mod.exports;
  }
})(this, function (exports) {
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

  Object.defineProperty(exports, '__esModule', { value: true });

  var App = function () {
    function App() {
      _classCallCheck(this, App);

      this.content = [];
    }

    _createClass(App, [{
      key: 'list',
      get: function get() {
        return this.content;
      },
      set: function set(content) {
        this.content = content;
      }
    }]);

    return App;
  }();

  var app = new App();

  exports.app = app;
});