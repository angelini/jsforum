var config  = require('../config');
var SPLIT   = config.SPLIT;

var db      = require('./db');

var Storage = function() {
  this.client = db;
}

Storage.prototype.cat = function() {
  var i = 0;
  var args = Array.prototype.slice.call(arguments);
  var response = '';

  for (i = 0; i < args.length; i++) {
    response += args[i] + (i === (args.length - 1) ? '': SPLIT);
  }

  return response;
}

Storage.prototype.split = function(key) {
  return key.split(SPLIT);
}

module.exports = Storage;