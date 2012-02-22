var config      = require('../config');
var NEXT        = config.NEXT;
var SECTION     = config.SECTION;
var SECTIONS    = config.SECTIONS;

var async   = require('async');
var Storage = require('./storage');

var SectionStorage = function() {
    Storage.call(this);
};

SectionStorage.prototype = Object.create(Storage.prototype);

SectionStorage.prototype.getSection = function(sid, callback) {
  this.client.hgetall(this.cat(SECTION, sid), callback);
};

SectionStorage.prototype.getSections = function(callback) {
  var that = this;

  this.client.smembers(SECTIONS, function(err, section_keys) {
    if (err) { return callback(err); }

    function getInfo(section_key, callback) {
      var sid = that.split(section_key).pop();
      that.getSection(sid, callback);
    }

    async.map(section_keys, getInfo, callback);
  });
};

SectionStorage.prototype.createSection = function(section_info, callback) {
  var that = this;

  this.client.incr(this.cat(NEXT, SECTIONS), function(err, sid) {
    section_info.id = sid;

    function addIndex(callback) {
      that.client.sadd(SECTIONS, that.cat(SECTION, sid), callback);
    }

    function setAttributes(callback) {
      that.client.hmset(that.cat(SECTION, sid), section_info, callback);
    }

    async.parallel([addIndex, setAttributes], function(err) {
      callback(err, sid);
    });
  });
};

SectionStorage.prototype.removeThread = function(sid, callback) {
  function removeIndex(callback) {
    this.client.srem(SECTIONS, this.cat(SECTION, sid), callback);
  };

  function removeAttributes(callback) {
    this.client.del(that.cat(SECTION, sid), callback);
  };

  async.parallel([removeIndex, removeAttributes], callback);
};

module.exports = SectionStorage;