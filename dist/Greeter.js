(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('Greeter', ['module', 'glob'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('glob'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.glob);
    global.Greeter = mod.exports;
  }
})(this, function (module) {
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

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _interopDefault(ex) {
    return ex && (typeof ex === 'undefined' ? 'undefined' : _typeof(ex)) === 'object' && 'default' in ex ? ex['default'] : ex;
  }

  var glob = _interopDefault();

  var app = function () {
    function app() {
      _classCallCheck(this, app);
    }

    _createClass(app, [{
      key: 'constuctor',
      value: function constuctor() {
        this.files = glob('content/*.json', {}, this.loaded);
      }
    }, {
      key: 'loaded',
      value: function loaded(args) {
        console.log(this.files);
      }
    }]);

    return app;
  }();

  module.exports = app;
});