var config  = require('../config');
var NEXT    = config.NEXT;
var SECTION = config.SECTION;
var THREAD  = config.THREAD;
var THREADS = config.THREADS;

var async   = require('async');
var Storage = require('./storage');

var ThreadStorage = function() {
    Storage.call(this);
};

ThreadStorage.prototype = Object.create(Storage.prototype);

ThreadStorage.prototype.getThread = function(sid, tid, callback) {
  this.client.hgetall(this.cat(THREAD, sid, tid), callback);
};

ThreadStorage.prototype.getThreads = function(sid, callback) {
  var that = this;

  this.client.smembers(this.cat(THREADS, sid), function(err, thread_keys) {
    if (err) { return callback(err); }

    function getInfo(thread_key, callback) {
      var tid = that.split(thread_key).pop();
      that.getThread(sid, tid, callback);
    }

    async.map(thread_keys, getInfo, callback);
  });
};

ThreadStorage.prototype.createThread = function(sid, thread_info, callback) {
  var that = this;

  this.client.incr(this.cat(NEXT, THREADS), function(err, tid) {
    thread_info.id = tid;
    
    function addIndex(callback) {
      that.client.sadd(that.cat(THREADS, sid), that.cat(THREAD, sid, tid), callback);
    };

    function setAttributes(callback) {
      that.client.hmset(that.cat(THREAD, sid, tid), thread_info, callback);
    };

    function incrSection(callback) {
      that.client.hincrby(that.cat(SECTION, sid), 'thread_count', 1, callback);
    };

    async.parallel([addIndex, setAttributes, incrSection], function(err) {
      callback(err, tid);
    });
  });
};

ThreadStorage.prototype.removeThread = function(sid, tid, callback) {
  function removeIndex(callback) {
    this.client.srem(that.cat(THREADS, sid), this.cat(THREAD, sid, tid), callback);
  };

  function removeAttributes(callback) {
    this.client.del(that.cat(THREAD, sid, tid), callback);
  };

  function decrSection(callback) {
    this.client.hincrby(that.cat(SECTION, sid), 'thread_count', -1, callback);
  };

  async.parallel([removeIndex, removeAttributes, decrSection], callback);
};

module.exports = ThreadStorage;