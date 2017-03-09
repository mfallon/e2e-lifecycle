(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('unknown', [], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.unknown = mod.exports;
  }
})(this, function () {
  'use strict';
});